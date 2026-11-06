(function () {
  const cfg = window.SHOP_CONFIG || {};
  const live = Boolean(cfg.supabaseUrl && cfg.supabasePublishableKey);
  const base = (cfg.supabaseUrl || '').replace(/\/$/, '');
  const catalogFile = 'catalog.json';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const auth = () => read('huongmuoi.admin.auth', null);
  const headers = (token, extra = {}) => ({ apikey: cfg.supabasePublishableKey, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra });
  async function request(path, options = {}, token) {
    const response = await fetch(base + path, { ...options, headers: headers(token, options.headers) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || payload?.error_description || `Lỗi kết nối ${response.status}`);
    return payload;
  }
  async function loadCatalog() {
    const response = await fetch(catalogFile, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Không tải được danh mục sản phẩm.');
    const catalog = await response.json();
    if (live) {
      const products = await request('/rest/v1/products?select=*&active=eq.true&order=sort_order.asc');
      return { looks: catalog.looks, products: products.map(p => ({ ...p, sizes: p.sizes || {} })) };
    }
    const edits = read('huongmuoi.demo.products', {});
    const ids = new Set(catalog.products.map(p => p.id));
    return { looks: catalog.looks, products: [...catalog.products.map(p => ({ ...p, ...(edits[p.id] || {}) })), ...Object.values(edits).filter(p => !ids.has(p.id))].filter(p => p.active !== false) };
  }
  async function login(email, password) {
    if (!live) throw new Error('Chế độ demo: dữ liệu quản trị chỉ lưu trên trình duyệt này.');
    const session = await request('/auth/v1/token?grant_type=password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    write('huongmuoi.admin.auth', { access_token: session.access_token, refresh_token: session.refresh_token, expires_at: Date.now() + session.expires_in * 1000 });
    return session;
  }
  async function token() {
    const session = auth();
    if (!session) return null;
    if (session.expires_at > Date.now() + 60000) return session.access_token;
    const refreshed = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
    write('huongmuoi.admin.auth', { access_token: refreshed.access_token, refresh_token: refreshed.refresh_token, expires_at: Date.now() + refreshed.expires_in * 1000 });
    return refreshed.access_token;
  }
  function logout() { localStorage.removeItem('huongmuoi.admin.auth'); }
  async function getAdminProducts() {
    if (live) { const jwt = await token(); if (!jwt) throw new Error('Bạn cần đăng nhập quản trị.'); return request('/rest/v1/products?select=*&order=sort_order.asc', {}, jwt); }
    const response = await fetch(catalogFile); const catalog = await response.json(); const edits = read('huongmuoi.demo.products', {}); const ids = new Set(catalog.products.map(p => p.id));
    return [...catalog.products.map(p => ({ ...p, ...(edits[p.id] || {}) })), ...Object.values(edits).filter(p => !ids.has(p.id))];
  }
  async function saveProduct(product) {
    const allowed = { id: product.id, name: product.name, category: product.category, gender: product.gender, style: product.style || 'knit', price: Number(product.price), sizes: product.sizes, image_url: product.image_url || null, tryon_images: product.tryon_images || {}, active: product.active !== false, color: product.color || '#777777', accent: product.accent || '#555555', sort_order: Number(product.sort_order) || 100 };
    if (live) {
      const jwt = await token();
      if (!jwt) throw new Error('Bạn cần đăng nhập quản trị.');
      const isNew = product.isNew;
      return request(isNew ? '/rest/v1/products' : `/rest/v1/products?id=eq.${encodeURIComponent(product.id)}`, { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(allowed) }, jwt);
    }
    const edits = read('huongmuoi.demo.products', {});
    edits[product.id] = allowed;
    write('huongmuoi.demo.products', edits);
    return allowed;
  }
  async function uploadImage(file, productId) {
    if (!file || !file.type.startsWith('image/')) throw new Error('Chọn một tệp ảnh hợp lệ.');
    if (file.size > 3 * 1024 * 1024) throw new Error('Ảnh cần nhỏ hơn 3 MB.');
    if (live) {
      const jwt = await token();
      if (!jwt) throw new Error('Bạn cần đăng nhập quản trị.');
      const extension = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${productId}-${Date.now()}.${extension}`;
      const response = await fetch(`${base}/storage/v1/object/products/${path}`, { method: 'POST', headers: headers(jwt, { 'Content-Type': file.type, 'x-upsert': 'true' }), body: file });
      if (!response.ok) throw new Error('Không tải được ảnh lên Storage.');
      return `${base}/storage/v1/object/public/products/${path}`;
    }
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Không đọc được ảnh.')); reader.readAsDataURL(file); });
  }
  async function submitOrder(customer, items) {
    if (live) return request('/rest/v1/rpc/place_order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, requested_items: items.map(({ id, size, qty }) => ({ id, size, qty })) }) });
    const catalog = await loadCatalog();
    let total = 0;
    const rows = items.map(item => {
      const p = catalog.products.find(x => x.id === item.id);
      if (!p || !p.sizes[item.size] || item.qty > p.sizes[item.size]) throw new Error(`Sản phẩm ${p?.name || item.id} không đủ size hoặc số lượng.`);
      total += p.price * item.qty;
      return { id: p.id, name: p.name, size: item.size, qty: item.qty, unit_price: p.price };
    });
    const code = `HM-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const order = { code, customer, items: rows, total, status: 'new', created_at: new Date().toISOString(), demo: true };
    write('huongmuoi.demo.orders', [order, ...read('huongmuoi.demo.orders', [])]);
    return { code, total, demo: true };
  }
  async function getOrders() {
    if (live) { const jwt = await token(); if (!jwt) throw new Error('Bạn cần đăng nhập quản trị.'); return request('/rest/v1/orders?select=*,order_items(*)&order=created_at.desc', {}, jwt); }
    return read('huongmuoi.demo.orders', []);
  }
  async function updateOrder(code, status) {
    if (live) { const jwt = await token(); if (!jwt) throw new Error('Bạn cần đăng nhập quản trị.'); return request(`/rest/v1/orders?code=eq.${encodeURIComponent(code)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }, jwt); }
    const orders = read('huongmuoi.demo.orders', []);
    const order = orders.find(x => x.code === code);
    if (order) order.status = status;
    write('huongmuoi.demo.orders', orders);
  }
  window.shopStore = { live, loadCatalog, getAdminProducts, login, token, logout, saveProduct, uploadImage, submitOrder, getOrders, updateOrder };
})();
