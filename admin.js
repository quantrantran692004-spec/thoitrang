const admin$ = selector => document.querySelector(selector);
const admin$$ = selector => [...document.querySelectorAll(selector)];
const adminMoney = value => new Intl.NumberFormat('vi-VN').format(value || 0) + '₫';
const adminSafe = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let adminProducts = [], adminOrders = [], editing = null;
const categoryNames = { top: 'Áo', bottom: 'Quần / Váy', shoes: 'Giày' };
const statusNames = { new: 'Mới', confirmed: 'Đã xác nhận', shipped: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã huỷ' };
function adminToast(message) { const el = admin$('#admin-toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3500); }
function showLogin() { admin$('#login-screen').hidden = false; admin$('#admin-shell').hidden = true; }
function showShell() { admin$('#login-screen').hidden = true; admin$('#admin-shell').hidden = false; admin$('#logout-button').hidden = !shopStore.live; admin$('#mode-badge').textContent = shopStore.live ? 'ĐANG KẾT NỐI' : 'DEMO LOCAL'; admin$('#mode-badge').classList.toggle('live', shopStore.live); admin$('#mode-notice').classList.toggle('live', shopStore.live); admin$('#mode-notice').textContent = shopStore.live ? 'Dữ liệu sản phẩm và đơn hàng đang đồng bộ trực tuyến. Những thay đổi đã lưu sẽ hiển thị cho khách truy cập.' : 'Chế độ demo: bạn có thể sửa sản phẩm và xem đơn mẫu. Dữ liệu chỉ lưu trên trình duyệt này; khách truy cập GitHub Pages sẽ không thấy thay đổi cho đến khi kết nối Supabase.'; }
async function loadAdmin() { adminProducts = await shopStore.getAdminProducts(); adminOrders = await shopStore.getOrders(); renderAdmin(); }
function renderAdmin() { renderStats(); renderProducts(); renderOrders(); }
function renderStats() {
  admin$('#stat-products').textContent = adminProducts.filter(p => p.active !== false).length;
  admin$('#stat-orders').textContent = adminOrders.filter(o => o.status === 'new').length;
  admin$('#stat-revenue').textContent = adminMoney(adminOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total || 0), 0));
  admin$('#recent-orders').innerHTML = adminOrders.length ? adminOrders.slice(0, 4).map(o => `<div class="recent-row"><strong>${adminSafe(o.code)}</strong><span>${adminSafe(o.customer?.name || '')}</span><b>${adminMoney(o.total)}</b></div>`).join('') : '<p class="empty-admin">Chưa có đơn hàng nào.</p>';
}
function renderProducts() {
  const query = admin$('#admin-product-search').value.trim().toLocaleLowerCase('vi'); const filter = admin$('#admin-product-filter').value;
  const rows = adminProducts.filter(p => p.name.toLocaleLowerCase('vi').includes(query) && (filter === 'all' || (filter === 'active' ? p.active !== false : p.active === false)));
  admin$('#products-table').innerHTML = rows.length ? rows.map(p => { const stock = Object.values(p.sizes || {}).reduce((sum, value) => sum + Number(value), 0); const photo = p.image_url ? `<img src="${adminSafe(p.image_url)}" alt=""/>` : `<span class="swatch" style="--swatch-color:${adminSafe(p.color || '#777')}"></span>`; return `<tr><td><div class="admin-product-cell">${photo}<div><strong>${adminSafe(p.name)}</strong><small>${adminSafe(p.id)}</small></div></div></td><td>${categoryNames[p.category] || p.category} · ${p.gender === 'women' ? 'Nữ' : p.gender === 'men' ? 'Nam' : 'Unisex'}</td><td><strong>${adminMoney(p.price)}</strong></td><td>${stock}</td><td><span class="status-chip ${p.active === false ? 'hidden' : 'active'}">${p.active === false ? 'Đã ẩn' : 'Đang bán'}</span></td><td><button type="button" class="edit-button" data-edit="${adminSafe(p.id)}">Chỉnh sửa ↗</button></td></tr>`; }).join('') : '<tr><td colspan="6" class="empty-admin">Không tìm thấy sản phẩm.</td></tr>';
}
function renderOrders() {
  admin$('#orders-table').innerHTML = adminOrders.length ? adminOrders.map(o => { const items = o.order_items || o.items || []; const date = new Date(o.created_at).toLocaleDateString('vi-VN'); return `<tr><td class="order-code"><strong>${adminSafe(o.code)}</strong><small>${date}</small></td><td class="order-customer"><strong>${adminSafe(o.customer?.name || '')}</strong><small>${adminSafe(o.customer?.phone || '')}<br/>${adminSafe(o.customer?.address || '')}</small></td><td>${items.map(i => `${adminSafe(i.name || i.product_name || i.id || '')} (${adminSafe(i.size)}) ×${Number(i.qty)}`).join('<br/>')}</td><td><strong>${adminMoney(o.total)}</strong></td><td><select class="order-select" data-order="${adminSafe(o.code)}" aria-label="Trạng thái đơn ${adminSafe(o.code)}">${Object.entries(statusNames).map(([key, label]) => `<option value="${key}" ${o.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select></td></tr>`; }).join('') : '<tr><td colspan="5" class="empty-admin">Chưa có đơn hàng nào.</td></tr>';
}
function setView(view) { admin$$('.admin-view').forEach(section => section.hidden = section.id !== `view-${view}`); admin$$('[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view)); admin$('#view-name').textContent = { overview: 'Tổng quan', products: 'Sản phẩm', orders: 'Đơn hàng' }[view]; }
function openProduct(id = null) {
  editing = id ? adminProducts.find(p => p.id === id) : null;
  const form = admin$('#product-form'); form.reset();
  form.elements.originalId.value = editing?.id || '';
  form.elements.id.value = editing?.id || '';
  form.elements.id.readOnly = Boolean(editing);
  form.elements.name.value = editing?.name || '';
  form.elements.category.value = editing?.category || 'top';
  form.elements.gender.value = editing?.gender || 'women';
  form.elements.price.value = editing?.price || '';
  for (const size of ['XS', 'S', 'M', 'L', 'XL']) form.elements[`stock${size}`].value = editing?.sizes?.[size] ?? 0;
  form.elements.color.value = editing?.color || '#777777'; form.elements.accent.value = editing?.accent || '#555555';
  form.elements.image_url.value = editing?.image_url?.startsWith('data:') ? '' : editing?.image_url || '';
  form.elements.tryon_men.value = editing?.tryon_images?.men || '';
  form.elements.tryon_women.value = editing?.tryon_images?.women || '';
  form.elements.active.checked = editing?.active !== false;
  admin$('#product-modal-title').innerHTML = editing ? 'Chỉnh sản phẩm<span>.</span>' : 'Thêm sản phẩm<span>.</span>';
  admin$('#product-modal').hidden = false; form.elements.name.focus();
}
function closeProduct() { admin$('#product-modal').hidden = true; editing = null; }
async function saveProduct(event) {
  event.preventDefault(); const form = event.currentTarget; const button = form.querySelector('button[type="submit"]');
  const id = form.elements.id.value.trim();
  if (!editing && adminProducts.some(p => p.id === id)) return adminToast('Mã sản phẩm đã tồn tại.');
  const p = { id, name: form.elements.name.value.trim(), category: form.elements.category.value, gender: form.elements.gender.value, price: Number(form.elements.price.value), sizes: Object.fromEntries(['XS','S','M','L','XL'].map(s => [s, Number(form.elements[`stock${s}`].value)])), color: form.elements.color.value, accent: form.elements.accent.value, image_url: form.elements.image_url.value.trim() || editing?.image_url || null, tryon_images: { men: form.elements.tryon_men.value.trim(), women: form.elements.tryon_women.value.trim() }, active: form.elements.active.checked, style: editing?.style || (form.elements.category.value === 'bottom' ? 'pants' : form.elements.category.value === 'shoes' ? 'sneakers' : 'knit'), sort_order: editing?.sort_order ?? adminProducts.length + 1, isNew: !editing };
  if (!p.name || !id || !Number.isFinite(p.price) || p.price < 0) return adminToast('Kiểm tra tên, mã và giá sản phẩm.');
  button.disabled = true;
  try { const file = form.elements.image_file.files[0]; if (file) p.image_url = await shopStore.uploadImage(file, id); await shopStore.saveProduct(p); await loadAdmin(); closeProduct(); adminToast('Đã lưu sản phẩm.'); } catch (error) { adminToast(error.message || 'Không lưu được sản phẩm.'); } finally { button.disabled = false; }
}
function bindAdmin() {
  admin$$('[data-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  admin$$('[data-go]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.go)));
  admin$('#admin-product-search').addEventListener('input', renderProducts); admin$('#admin-product-filter').addEventListener('change', renderProducts);
  admin$('#products-table').addEventListener('click', event => { const btn = event.target.closest('[data-edit]'); if (btn) openProduct(btn.dataset.edit); });
  admin$('#new-product').addEventListener('click', () => openProduct()); admin$('#close-product-modal').addEventListener('click', closeProduct); admin$('#cancel-product').addEventListener('click', closeProduct); admin$('#product-modal').addEventListener('click', event => { if (event.target.id === 'product-modal') closeProduct(); });
  admin$('#product-form').addEventListener('submit', saveProduct);
  admin$('#orders-table').addEventListener('change', async event => { const select = event.target.closest('[data-order]'); if (!select) return; try { await shopStore.updateOrder(select.dataset.order, select.value); adminOrders = await shopStore.getOrders(); renderAdmin(); adminToast('Đã cập nhật trạng thái đơn.'); } catch (error) { adminToast(error.message); } });
  admin$('#refresh-orders').addEventListener('click', async () => { try { adminOrders = await shopStore.getOrders(); renderAdmin(); adminToast('Đã cập nhật danh sách đơn.'); } catch (error) { adminToast(error.message); } });
  admin$('#login-form').addEventListener('submit', async event => { event.preventDefault(); const data = new FormData(event.target); admin$('#login-error').textContent = ''; try { await shopStore.login(String(data.get('email')), String(data.get('password'))); await loadAdmin(); showShell(); } catch (error) { admin$('#login-error').textContent = error.message || 'Không đăng nhập được.'; } });
  admin$('#logout-button').addEventListener('click', () => { shopStore.logout(); showLogin(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeProduct(); });
}
async function initAdmin() { bindAdmin(); if (shopStore.live) { try { if (!(await shopStore.token())) return showLogin(); await loadAdmin(); showShell(); } catch { shopStore.logout(); showLogin(); } } else { await loadAdmin(); showShell(); } }
initAdmin();
