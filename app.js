const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat('vi-VN').format(value || 0) + '₫';
const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const categories = { top: 'ÁO', bottom: 'QUẦN / VÁY', shoes: 'GIÀY', accessories: 'PHỤ KIỆN' };
const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const modelProfiles = {
  women: [
    { name: 'Mai', measure: 'Dáng nhỏ / 1m55', skin: '#e2ad8d', hair: '#241b18', width: .83, hairStyle: 0 },
    { name: 'Hà', measure: 'Dáng gọn / 1m61', skin: '#d39a73', hair: '#221b1a', width: .91, hairStyle: 1 },
    { name: 'Linh', measure: 'Dáng cân đối / 1m66', skin: '#c98e6d', hair: '#30211e', width: 1, hairStyle: 2 },
    { name: 'Vy', measure: 'Dáng đầy đặn / 1m69', skin: '#b87957', hair: '#1e1b1a', width: 1.1, hairStyle: 0 },
    { name: 'Phương', measure: 'Dáng cong / 1m70', skin: '#a66b4d', hair: '#31201a', width: 1.2, hairStyle: 1 }
  ],
  men: [
    { name: 'Minh', measure: 'Dáng nhỏ / 1m65', skin: '#e0ab85', hair: '#25201d', width: .84, hairStyle: 1 },
    { name: 'An', measure: 'Dáng gọn / 1m70', skin: '#c78e69', hair: '#1d1b1a', width: .92, hairStyle: 0 },
    { name: 'Khoa', measure: 'Dáng cân đối / 1m75', skin: '#b9825f', hair: '#28211e', width: 1, hairStyle: 2 },
    { name: 'Huy', measure: 'Dáng rộng vai / 1m78', skin: '#aa7154', hair: '#1f1c1b', width: 1.1, hairStyle: 1 },
    { name: 'Bình', measure: 'Dáng lớn / 1m80', skin: '#996448', hair: '#24201c', width: 1.21, hairStyle: 0 }
  ]
};
const state = { products: [], looks: [], lookEdits: [], index: 0, playing: false, gender: 'women', size: 'M', category: 'all', selection: { top: null, bottom: null, shoes: null }, cart: [], timer: null, toastTimer: null };
const product = id => state.products.find(p => p.id === id);
const visibleTo = (p, gender = state.gender) => p && (p.gender === 'unisex' || p.gender === gender);

function productArt(p) {
  if (!p) return '';
  if (p.image_url) return `<img class="product-photo" src="${safe(p.image_url)}" alt="${safe(p.name)}" loading="lazy" />`;
  const fill = safe(p.color || '#777');
  const accent = safe(p.accent || '#555');
  const line = '#ffffff55';
  let shape;
  if (p.category === 'top') {
    if (p.style === 'jacket' || p.style === 'blazer') shape = `<path fill="${fill}" d="M83 20 66 33 42 59 57 76 72 63 70 142 150 142 148 63 163 76 178 59 154 33 137 20 121 34 99 34Z"/><path fill="${accent}" d="m99 34 11 50-31-51 10-13Zm22 0-11 50 31-51-10-13Z"/><path d="M110 62v80" stroke="${line}" stroke-width="2"/><circle cx="113" cy="94" r="2" fill="${line}"/>`;
    else if (p.style === 'shirt') shape = `<path fill="${fill}" d="M82 20 59 35 40 57 55 75 72 61 71 145 149 145 148 61 165 75 180 57 161 35 138 20 121 31 99 31Z"/><path fill="${accent}" d="m82 20 28 32-22-4-12-21Zm56 0-28 32 22-4 12-21Z"/><path d="M110 50v94" stroke="${accent}" stroke-width="2"/><circle cx="113" cy="77" r="2" fill="${accent}"/><circle cx="113" cy="99" r="2" fill="${accent}"/>`;
    else shape = `<path fill="${fill}" d="M82 22 62 35 38 66 57 81 75 63 70 142 150 142 145 63 163 81 182 66 158 35 138 22 122 37 98 37Z"/><path d="M98 37q12 16 24 0M74 132h72M51 72l15-25m103 25-15-25" stroke="${accent}" stroke-width="3" fill="none"/>`;
  } else if (p.style === 'skirt') shape = `<path fill="${fill}" d="M76 22h68l26 118H50Z"/><path d="M76 23h68M86 40 73 134m31-94-3 94m33-94 13 94" stroke="${accent}" stroke-width="3" fill="none"/>`;
  else if (p.category === 'bottom') shape = `<path fill="${fill}" d="M67 20h86l-7 121-27 1-9-66-9 66-27-1Z"/><path d="M110 22v54m-35-46h70M101 76l-7 65m25-65 7 65" stroke="${accent}" stroke-width="2.5" fill="none"/>`;
  else shape = `<path fill="${fill}" d="M17 98q13-20 43-17l28 12 34-1 17 16q8 21-8 27H24q-19-3-7-37Z"/><path fill="${fill}" d="M112 72q13-13 32-10l27 20 31 9q18 16 6 37H112q-17-11 0-56Z"/><path d="M20 119h113m-17-3h90M48 95l26 12m76-24 25 16" stroke="${accent}" stroke-width="3" fill="none"/>`;
  return `<svg viewBox="0 0 220 165" aria-hidden="true">${shape}</svg>`;
}

function avatarSvg(gender = state.gender, size = state.size, selection = state.selection) {
  const profile = modelProfiles[gender][sizes.indexOf(size)];
  const top = product(selection.top), bottom = product(selection.bottom), shoes = product(selection.shoes);
  const woman = gender === 'women';
  const hair = profile.hairStyle === 0 ? `<path fill="${profile.hair}" d="M145 83q-10-65 35-67 48 0 37 71l-14 37-12-17-23 1-16 22Z"/>` : profile.hairStyle === 1 ? `<path fill="${profile.hair}" d="M146 78q-9-59 32-63 52-2 41 63l-18-21q-14 19-43 10l-7 25Z"/><path fill="${profile.hair}" d="M209 69q21 15 7 91l-15 17-1-67Z"/>` : `<path fill="${profile.hair}" d="M149 85q-15-63 28-68 47-4 44 67l-15-34q-18 18-45 4Z"/><path fill="${profile.hair}" d="M151 73q-24 37-5 85l15-13Z"/>`;
  const topFill = top?.color || (woman ? '#e9d6c9' : '#e3dfd8');
  const topAccent = top?.accent || '#c3afa3';
  const bottomFill = bottom?.color || '#e6dbcc';
  const bottomAccent = bottom?.accent || '#bcb1a4';
  const shoeFill = shoes?.color || '#d7c8b8';
  const shoeAccent = shoes?.accent || '#a6927e';
  const topShape = top?.style === 'jacket' || top?.style === 'blazer'
    ? `<path d="M132 155 105 169 93 256 121 264 131 220 130 326h100l-1-106 10 44 28-8-14-87-30-15-28 27h-35Z" fill="${topFill}"/><path d="m161 156 19 82-42-82 19-7Zm37 0-18 82 42-82-19-7Z" fill="${topAccent}"/><path d="M180 232v93" stroke="#ffffff66" stroke-width="2" fill="none"/>`
    : top?.style === 'shirt'
    ? `<path d="M132 156 104 170 91 240 118 252 135 217 132 326h96l-1-109 17 35 27-12-14-70-29-14-32 17h-30Z" fill="${topFill}"/><path d="m157 156 23 37-25-10-10-28Zm46 0-23 37 25-10 10-28Z" fill="${topAccent}"/><path d="M180 190v135" stroke="${topAccent}" stroke-width="2" fill="none"/>`
    : `<path d="M132 155 101 169 89 238 116 251 134 214 128 325h104l-6-111 18 37 27-13-13-69-31-14-27 18h-39Z" fill="${topFill}"/><path d="M162 172q18 14 36 0M130 313h101M101 227l19-49m140 49-19-49" stroke="${topAccent}" stroke-width="3" fill="none"/>`;
  const bottomShape = bottom?.style === 'skirt'
    ? `<path d="M133 316h94l26 118-144 1Z" fill="${bottomFill}"/><path d="m148 329-18 100m47-100-1 102m26-102 20 100" stroke="${bottomAccent}" stroke-width="2" fill="none"/>`
    : `<path d="M132 316h96l-3 64-15 144h-34l-8-134-8 134h-35l-13-144Z" fill="${bottomFill}"/><path d="M180 320v70m-46-54h92m-65 56-15 128m63-128 9 128" stroke="${bottomAccent}" stroke-width="2" fill="none"/>`;
  const feet = `<path d="M126 522h36l2 29q-11 15-54 10-12-5 0-20Z" fill="${shoeFill}"/><path d="M177 522h35l21 28q9 15-7 14h-57q-12-3 8-42Z" fill="${shoeFill}"/><path d="M108 555q31 4 56-3m7 6 63-4" stroke="${shoeAccent}" stroke-width="3" fill="none"/>`;
  return `<svg viewBox="0 0 360 575" aria-hidden="true"><ellipse cx="180" cy="566" rx="85" ry="7" fill="#cebfb164"/><g transform="translate(${180 - 180 * profile.width} 0) scale(${profile.width} 1)"><path d="M135 315h90l-9 219h-35l-10-150-8 150h-35Z" fill="${profile.skin}"/><path d="M130 157q50-35 100 0l16 161H114Z" fill="${profile.skin}"/><path d="M135 168q-20-2-32 26l-21 120q1 20 15 22t19-18l25-87Zm90 0q20-2 32 26l21 120q-1 20-15 22t-19-18l-25-87Z" fill="${profile.skin}"/><path d="M166 119h28v40q-12 16-28 0Z" fill="${profile.skin}"/><ellipse cx="180" cy="79" rx="34" ry="47" fill="${profile.skin}"/>${hair}<path d="M160 82h9m22 0h9" stroke="#4e3128" stroke-width="2.4" stroke-linecap="round"/><path d="M176 101q5 5 10 0" stroke="#8e5547" stroke-width="2" fill="none" stroke-linecap="round"/>${bottomShape}${topShape}${feet}</g></svg>`;
}

// Each photograph shares the same head-to-toe frame. The model, top, bottom and
// shoes are separate image layers so changing one item does not reset the rest.
const photoLooks = {
  'red-knit': { men: 'assets/looks/look-1.png', women: 'assets/looks/model-women-xs.png' },
  'black-jacket': { women: 'assets/looks/look-2.png' },
  'ivory-shirt': { men: 'assets/looks/look-3.png', women: 'assets/looks/model-women-xl.png' },
  'red-blazer': { women: 'assets/looks/look-4.png' },
  'olive-overshirt': { men: 'assets/looks/look-5.png' },
  'cream-knit': { women: 'assets/looks/look-6.png' },
  'charcoal-jeans': { men: 'assets/looks/look-1.png', women: 'assets/looks/model-women-xs.png' },
  'indigo-jeans': { women: 'assets/looks/look-2.png' },
  'sand-trousers': { men: 'assets/looks/look-3.png', women: 'assets/looks/model-women-xl.png' },
  'black-skirt': { women: 'assets/looks/look-4.png' },
  'black-trousers': { men: 'assets/looks/look-5.png' },
  'blue-jeans': { women: 'assets/looks/look-6.png' },
  'cream-sneakers': { men: 'assets/looks/look-3.png', women: 'assets/looks/model-women-xl.png' },
  'black-boots': { women: 'assets/looks/look-4.png' },
  'burgundy-flats': { women: 'assets/looks/look-6.png' }
};
const sizeModels = {
  women: { XS: 'assets/looks/model-women-xs.png', S: 'assets/looks/look-2.png', M: 'assets/looks/look-6.png', L: 'assets/looks/look-4.png', XL: 'assets/looks/model-women-xl.png' },
  men: { XS: 'assets/looks/model-men-xs.png', S: 'assets/looks/look-3.png', M: 'assets/looks/look-1.png', L: 'assets/looks/look-5.png', XL: 'assets/looks/model-men-xl.png' }
};
function fittingPhoto(gender, size, selection, lookImage = '', lookGender = gender) {
  return `<div class="photo-model" role="img" aria-label="Ảnh bộ trang phục có sẵn"><img class="photo-layer photo-whole" src="${safe(lookImage)}" alt="" draggable="false" /></div>`;
}

const tryOnProvider = new window.TryOnProvider.SavedLookProvider();

function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => el.classList.remove('show'), 3500); }
function renderModels() {
  const container = $('#runway-models');
  state.looks.forEach((look, i) => { const edit = state.lookEdits[i]; const pins = i === state.index ? ['top','bottom','shoes'].map((category, n) => { const p = product(edit.selection[category]); return p ? `<button type="button" class="model-pin pin-${category}" data-pin-category="${category}" aria-label="${n + 1}: ${safe(p.name)}" title="${safe(p.name)}">${n + 1}</button>` : ''; }).join('') : ''; const view = i === state.index ? `<button type="button" class="model-view" data-view-active aria-label="Xem chi tiết set ${safe(look.name)}"></button>` : ''; let el = container.children[i]; if (!el) { el = document.createElement('div'); el.className = 'runway-person'; el.dataset.person = i; container.append(el); } const html = fittingPhoto(edit.gender, state.size, edit.selection, look.image, look.gender) + view + pins; if (el.innerHTML !== html) el.innerHTML = html; });
  positionModels();
}
function positionModels() {
  $$('.runway-person').forEach((el, i) => {
    let delta = (i - state.index + state.looks.length) % state.looks.length;
    if (delta > 2) delta -= state.looks.length;
    const pos = { '-3': [-8, .48, .15, 6], '-2': [8, .61, .36, 3], '-1': [29, .72, .65, 1.4], '0': [55, 1, 1, 0], '1': [80, .72, .65, 1.4], '2': [101, .61, .36, 3] }[delta];
    el.style.left = pos[0] + '%'; el.style.transform = `translateX(-50%) translateZ(${(pos[1]-1)*450}px) rotateY(${-delta*12}deg) scale(${pos[1]})`; el.style.opacity = Math.abs(delta) === 3 ? '0' : '1'; el.style.filter = 'none'; el.style.zIndex = 6 - Math.abs(delta);
  });
}
function renderProgress() {
  $('#look-progress').innerHTML = state.looks.map((look, i) => `<button type="button" role="tab" class="progress-item ${i === state.index ? 'active' : ''} ${i === state.index && state.playing ? 'playing' : ''}" data-look="${i}" aria-label="Look ${i + 1}: ${safe(look.name)}" aria-selected="${i === state.index}"><span class="progress-line"></span><span class="progress-label">${String(i + 1).padStart(2, '0')}${i === state.index ? ` / ${safe(look.name)}` : ''}</span></button>`).join('');
}
function renderLook() {
  const look = state.looks[state.index]; if (!look) return;
  const pieces = Object.values(state.selection).filter(id => product(id));
  const profile = modelProfiles[state.gender][sizes.indexOf(state.size)];
  $('#look-number').textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(state.looks.length).padStart(2, '0')}`;
  $('#look-title').textContent = look.name;
  $('#look-description').textContent = `${state.gender === 'women' ? 'Mẫu nữ' : 'Mẫu nam'} · Ảnh bộ phối có sẵn. ${look.description}`;
  $$('#hero-gender-tabs button').forEach(btn => { const active = btn.dataset.heroGender === state.gender; btn.classList.toggle('active', active); btn.setAttribute('aria-selected', active); });
  $('#hero-size-options').innerHTML = sizes.map(size => `<button type="button" data-hero-size="${size}" class="${size === state.size ? 'active' : ''}" aria-pressed="${size === state.size}">${size}</button>`).join('');
  $('#look-piece-count').textContent = `${String(pieces.length).padStart(2, '0')} MÓN`;
  $('#bundle-piece-count').textContent = `${String(pieces.length).padStart(2, '0')} MÓN`;
  $('#add-look').disabled = pieces.length === 0;
  $('#look-products').innerHTML = ['top', 'bottom', 'shoes'].map(category => {
    const id = state.selection[category];
    if (!id || !product(id)) return `<div class="look-slot-empty"><span>${categories[category]} · CHƯA CHỌN</span><button type="button" data-open-category="${category}">CHỌN ↗</button></div>`;
    const p = product(id); if (!p) return '';
    const available = sizes.filter(s => p.sizes?.[s] > 0);
    return `<div class="look-product" data-product="${safe(p.id)}"><div class="look-thumb">${productArt(p)}</div><div class="look-product-info"><small>${categories[p.category]}</small><strong>${safe(p.name)}</strong><span>${money(p.price)}</span><select class="mini-size" aria-label="Size ${safe(p.name)}">${available.map(s => `<option ${s === state.size ? 'selected' : ''}>${s}</option>`).join('')}</select></div><button class="add-mini" type="button" data-add-mini="${safe(p.id)}" aria-label="Thêm ${safe(p.name)} vào giỏ">+</button></div>`;
  }).join('');
  $('#bundle-total').textContent = money(pieces.reduce((sum, id) => sum + (product(id)?.price || 0), 0));
  renderProgress(); positionModels(); renderHeroWardrobe();
}
function setLook(index) { closeLookModal(); state.index = (index + state.looks.length) % state.looks.length; const edit = state.lookEdits[state.index]; state.gender = edit.gender; state.selection = { ...edit.selection }; persistFitting(); renderModels(); renderLook(); renderWardrobe(); renderBuilder(); restartAutoplay(); const stage = $('#runway-stage'); stage.classList.remove('scan-active'); void stage.offsetWidth; stage.classList.add('scan-active'); }
function restartAutoplay() { clearInterval(state.timer); if (state.playing && !matchMedia('(prefers-reduced-motion: reduce)').matches) { state.timer = setInterval(() => setLook(state.index + 1), 5000); } }
function pauseAutoplay() { if (!state.playing) return; state.playing = false; clearInterval(state.timer); $('#look-play').setAttribute('aria-pressed', 'false'); $('#look-play').setAttribute('aria-label', 'Tự động chuyển look'); $('#play-icon').textContent = '▶'; renderProgress(); }
function persistFitting() { localStorage.setItem('huongmuoi.fitting', JSON.stringify({ size: state.size, index: state.index, edits: state.lookEdits })); }
function saveCurrentEdit() { state.lookEdits[state.index] = { gender: state.gender, selection: { ...state.selection } }; persistFitting(); }
function renderHeroWardrobe() {
  const query = $('#hero-search-input').value.trim().toLocaleLowerCase('vi');
  const list = state.products.filter(p => (state.category === 'all' || state.category === p.category) && p.name.toLocaleLowerCase('vi').includes(query));
  $$('#hero-category-tabs button').forEach(btn => { const active = btn.dataset.heroCategory === state.category; btn.classList.toggle('active', active); btn.setAttribute('aria-selected', active); });
  $('#hero-wardrobe').innerHTML = list.length ? list.map(p => `<article class="hero-item" draggable="true" data-hero-drag="${safe(p.id)}" tabindex="0" aria-label="${safe(p.name)}, ${money(p.price)}"><div class="hero-item-art">${productArt(p)}</div><div class="hero-item-info"><strong>${safe(p.name)}</strong><span>${money(p.price)}</span><button type="button" data-hero-try="${safe(p.id)}">XEM SẢN PHẨM ↗</button></div></article>`).join('') : '<p class="empty-note">Không có món phù hợp.</p>';
}
function renderWardrobe() {
  const query = $('#product-search').value.trim().toLocaleLowerCase('vi');
  const list = state.products.filter(p => visibleTo(p) && (state.category === 'all' || state.category === p.category) && p.name.toLocaleLowerCase('vi').includes(query));
  $('#wardrobe-list').innerHTML = list.length ? list.map(p => `<article class="wardrobe-item" draggable="true" data-drag-id="${safe(p.id)}" tabindex="0" aria-label="${safe(p.name)}, ${money(p.price)}"><div class="wardrobe-art">${productArt(p)}</div><small>${categories[p.category]}</small><strong>${safe(p.name)}</strong><div class="item-foot"><span>${money(p.price)}</span><button type="button" data-try="${safe(p.id)}" aria-label="Thử ${safe(p.name)} lên mẫu">↗</button></div></article>`).join('') : `<p class="empty-note">Không tìm thấy món đồ phù hợp.</p>`;
  renderHeroWardrobe();
}
function renderBuilder() {
  const profile = modelProfiles[state.gender][sizes.indexOf(state.size)];
  $('#size-options').innerHTML = sizes.map(s => `<button type="button" data-size="${s}" class="${s === state.size ? 'active' : ''}" aria-pressed="${s === state.size}">${s}</button>`).join('');
  $('#model-render').innerHTML = fittingPhoto(state.gender, state.size, state.selection, state.looks[state.index].image, state.gender);
  $('#model-render').setAttribute('aria-label', `Mẫu ${profile.name} size ${state.size} với trang phục đang chọn`);
  $('#model-label').textContent = `${profile.name.toUpperCase()} / SIZE ${state.size}`;
  $('#model-name').textContent = `Mẫu ${profile.name}`;
  $('#model-measure').textContent = profile.measure;
  $('#selected-slots').innerHTML = ['top', 'bottom', 'shoes'].map((category, i) => {
    const p = product(state.selection[category]);
    return `<div class="selected-slot"><span class="slot-number">0${i + 1}</span><div><strong>${p ? safe(p.name) : categories[category]}</strong><small>${p ? (p.sizes?.[state.size] ? `Size ${state.size} · ${money(p.price)}` : `Hết size ${state.size} · chọn size khác`) : 'Chưa chọn món'}</small></div>${p ? `<button type="button" data-remove-slot="${category}" aria-label="Bỏ ${safe(p.name)}">×</button>` : '<span>+</span>'}</div>`;
  }).join('');
  $('#selection-total').textContent = money(Object.values(state.selection).reduce((sum, id) => sum + (product(id)?.price || 0), 0));
}
function chooseProduct(id) {
  const p = product(id); if (!p) return; pauseAutoplay();
  const result = tryOnProvider.preview({ productId: id, looks: state.looks });
  const matchesCurrent = state.looks[state.index].products.includes(id);
  const available = sizes.filter(size => p.sizes?.[size] > 0);
  let backdrop = $('#product-detail');
  if (!backdrop) { backdrop = document.createElement('div'); backdrop.id = 'product-detail'; backdrop.className = 'look-modal-backdrop'; document.body.append(backdrop); }
  const visual = p.image_url ? productArt(p) : photoLooks[p.id]?.[p.gender === 'women' ? 'women' : 'men'] ? `<img class="detail-model-image" src="${safe(photoLooks[p.id][p.gender === 'women' ? 'women' : 'men'])}" alt="" />` : productArt(p);
  backdrop.innerHTML = `<section class="product-detail" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button class="close-button detail-close" type="button" data-detail-close aria-label="Đóng">×</button><div class="detail-visual">${visual}</div><div class="detail-info"><span class="panel-kicker">${safe(categories[p.category] || 'SẢN PHẨM')}</span><h2 id="detail-title">${safe(p.name)}</h2><strong class="detail-price">${money(p.price)}</strong><p>${matchesCurrent ? 'Sản phẩm có trong bộ phối đang hiển thị.' : 'Ảnh của tổ hợp mới chưa được cập nhật. Ảnh người mẫu hiện tại được giữ nguyên.'}</p><label>Size <select id="detail-size">${available.map(s => `<option ${s === state.size ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label>Số lượng <input id="detail-qty" type="number" min="1" value="1" max="${Math.max(0,...available.map(s => p.sizes[s]))}" /></label><p>Màu: ${safe(p.color_name || 'theo ảnh sản phẩm')}</p><button type="button" class="btn btn-red" data-detail-add="${safe(p.id)}" ${available.length ? '' : 'disabled'}>Thêm vào giỏ ↗</button><div class="detail-suggestions"><strong>BỘ PHỐI CÓ ẢNH</strong>${result.looks.length ? result.looks.map(look => `<button type="button" data-detail-look="${state.looks.indexOf(look)}">${safe(look.name)} ↗</button>`).join('') : '<p>Chưa có bộ phối cho sản phẩm này.</p>'}</div></div></section>`;
  backdrop.hidden = false; document.body.classList.add('modal-open'); backdrop.querySelector('[data-detail-close]').focus({preventScroll:true});
}
function setGender(gender) {
  const index = state.looks.findIndex(look => look.gender === gender && look.image); if (index < 0) return toast('Chưa có ảnh bộ phối cho nhóm mẫu này.'); pauseAutoplay(); setLook(index);
}
function setSize(size) {
  if (!sizes.includes(size)) return; state.size = size; renderLook(); toast('Size dùng để chọn mua; ảnh bộ phối giữ nguyên.');
}
function setCategory(category) {
  state.category = category; $$('#category-tabs button').forEach(btn => { const active = btn.dataset.category === category; btn.classList.toggle('active', active); btn.setAttribute('aria-selected', active); }); renderWardrobe();
}
function renderFeatured() {
  $('#featured-products').innerHTML = state.products.map(p => {
    const gender = p.gender === 'unisex' ? 'men' : p.gender;
    const source = p.image_url || p.tryon_images?.[gender] || photoLooks[p.id]?.[gender];
    const visual = source ? `<img class="feature-model-photo focus-${p.category}" src="${safe(source)}" alt="" loading="lazy" />` : productArt(p);
    const fitting = state.looks.some(look => look.products.includes(p.id) && look.image);
    const available = sizes.filter(size => p.sizes?.[size] > 0);
    return `<article class="feature-card" data-feature="${safe(p.id)}">
      <div class="feature-art"><span class="tag">${safe(categories[p.category])} / ${p.gender === 'men' ? 'NAM' : p.gender === 'women' ? 'NỮ' : 'UNISEX'}</span>${visual}<button class="feature-try" type="button" data-feature-try="${safe(p.id)}" aria-label="Xem ${safe(p.name)}"></button></div>
      <div class="feature-info"><div><strong>${safe(p.name)}</strong><small>${fitting ? 'Xem sản phẩm và bộ phối' : 'Xem sản phẩm · ảnh bộ phối đang cập nhật'}</small></div><span>${money(p.price)}</span></div>
      <div class="feature-buy"><select class="feature-size" aria-label="Chọn size ${safe(p.name)}">${available.map(size => `<option value="${size}" ${size === state.size ? 'selected' : ''}>${size}</option>`).join('')}</select><button type="button" data-feature-add="${safe(p.id)}" ${available.length ? '' : 'disabled'}>THÊM VÀO GIỎ ↗</button></div>
    </article>`;
  }).join('');
}
function renderEditorial() {
  $('#editorial-grid').innerHTML = state.looks.map((look, i) => `<article class="editorial-card"><div class="editorial-photo"><img src="${safe(look.image)}" alt="Người mẫu mặc set ${safe(look.name)}" loading="lazy" /></div><div class="editorial-card-foot"><div><small>LOOK ${String(i + 1).padStart(2, '0')} / ${look.gender === 'women' ? 'NỮ' : 'NAM'}</small><h3>${safe(look.name)}</h3></div><button type="button" data-inspiration="${i}" aria-label="Xem bộ ${safe(look.name)}">XEM BỘ PHỐI ↗</button></div></article>`).join('');
}
function renderLookModal() {
  const look = state.looks[state.index], profile = modelProfiles[state.gender][sizes.indexOf(state.size)];
  $('#modal-look-title').textContent = look.name;
  $('#modal-look-profile').textContent = `Mẫu ${state.gender === 'women' ? 'nữ' : 'nam'} · Ảnh bộ phối có sẵn`;
  $('#look-modal-stage').innerHTML = fittingPhoto(state.gender, state.size, state.selection, look.image, look.gender) + ['top','bottom','shoes'].map((category, i) => { const p = product(state.selection[category]); return p ? `<button class="modal-pin modal-pin-${category}" type="button" data-modal-pin="${category}" aria-label="${i + 1}: ${safe(p.name)}">${i + 1}</button>` : ''; }).join('');
  $('#modal-look-products').innerHTML = ['top','bottom','shoes'].map(category => { const p = product(state.selection[category]); if (!p) return ''; const available = sizes.filter(s => p.sizes?.[s] > 0); return `<div class="modal-product" data-modal-product="${safe(p.id)}" data-modal-category="${category}"><div class="look-thumb">${productArt(p)}</div><div><small>${categories[category]}</small><strong>${safe(p.name)}</strong><span>${money(p.price)}</span><select aria-label="Size ${safe(p.name)}">${available.map(s => `<option ${s === state.size ? 'selected' : ''}>${s}</option>`).join('')}</select></div><button type="button" data-modal-add="${safe(p.id)}" aria-label="Thêm ${safe(p.name)} vào giỏ">+</button></div>`; }).join('') || '<p class="empty-note">Mẫu chưa mặc món nào. Chọn đồ trong tủ bên ngoài.</p>';
  $('#modal-look-total').textContent = money(Object.values(state.selection).reduce((sum, id) => sum + (product(id)?.price || 0), 0));
  $('#modal-add-look').disabled = !Object.values(state.selection).some(Boolean);
}
function openLookModal() { pauseAutoplay(); renderLookModal(); $('#look-modal').hidden = false; document.body.classList.add('modal-open'); $('#close-look-modal').focus({preventScroll:true}); }
function closeLookModal() { $('#look-modal').hidden = true; document.body.classList.remove('modal-open'); }
function persistCart() { localStorage.setItem('huongmuoi.cart', JSON.stringify(state.cart)); renderCart(); }
function addCart(id, size, qty = 1) {
  const p = product(id); if (!p) return false;
  const existing = state.cart.find(item => item.id === id && item.size === size);
  const nextQty = (existing?.qty || 0) + qty;
  if (!p.sizes?.[size] || nextQty > p.sizes[size]) { toast(`${p.name} chỉ còn ${p.sizes?.[size] || 0} sản phẩm size ${size}.`); return false; }
  if (existing) existing.qty = nextQty; else state.cart.push({ id, size, qty });
  persistCart(); toast(`Đã thêm ${p.name} · size ${size} vào giỏ.`); return true;
}
function addMany(items) {
  if (!items.length) return toast('Chọn ít nhất một món để thêm vào giỏ.');
  const grouped = new Map();
  for (const item of items) { const key = `${item.id}|${item.size}`; grouped.set(key, { ...item, qty: (grouped.get(key)?.qty || 0) + (item.qty || 1) }); }
  for (const item of grouped.values()) {
    const p = product(item.id), current = state.cart.find(x => x.id === item.id && x.size === item.size)?.qty || 0;
    if (!p || !p.sizes?.[item.size] || current + item.qty > p.sizes[item.size]) return toast(`${p?.name || 'Sản phẩm'} không đủ size ${item.size} hoặc số lượng.`);
  }
  for (const item of grouped.values()) { const existing = state.cart.find(x => x.id === item.id && x.size === item.size); if (existing) existing.qty += item.qty; else state.cart.push(item); }
  persistCart(); toast(`Đã thêm ${items.length} món vào giỏ.`); openCart();
}
function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0); $('#bag-count').textContent = count;
  $('#cart-items').innerHTML = state.cart.length ? state.cart.map((item, i) => { const p = product(item.id); if (!p) return ''; return `<div class="cart-row"><div class="cart-row-art">${productArt(p)}</div><div><div class="cart-row-head"><strong>${safe(p.name)}</strong><button class="remove-item" type="button" data-cart-remove="${i}" aria-label="Xoá ${safe(p.name)}">×</button></div><small>Size ${item.size} · ${categories[p.category]}</small><span class="row-price">${money(p.price * item.qty)}</span><div class="qty-control"><button type="button" data-cart-qty="${i}" data-change="-1" aria-label="Giảm số lượng">−</button><span>${item.qty}</span><button type="button" data-cart-qty="${i}" data-change="1" aria-label="Tăng số lượng">+</button></div></div></div>`; }).join('') : `<div class="cart-empty"><strong>Giỏ hàng đang trống.</strong><p>Chọn một look hoặc tự phối set đầu tiên của bạn.</p></div>`;
  $('#cart-total').textContent = money(state.cart.reduce((sum, item) => sum + (product(item.id)?.price || 0) * item.qty, 0));
  $('#checkout-button').disabled = !state.cart.length;
}
function openCart() { $('#drawer-backdrop').hidden = false; $('#cart-drawer').classList.add('open'); $('#cart-drawer').setAttribute('aria-hidden', 'false'); $('#close-cart').focus(); }
function closeCart() { $('#cart-drawer').classList.remove('open'); $('#cart-drawer').setAttribute('aria-hidden', 'true'); $('#drawer-backdrop').hidden = true; }
function openCheckout() { if (!state.cart.length) return; closeCart(); $('#checkout-backdrop').hidden = false; $('#checkout-form input').focus(); }
function closeCheckout() { $('#checkout-backdrop').hidden = true; }
function bindEvents() {
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('#product-detail') && !$('#product-detail').hidden) { $('#product-detail').hidden = true; document.body.classList.remove('modal-open'); } });
  $('#favorite-next').addEventListener('click', () => { let ids; try { ids = JSON.parse(localStorage.getItem('huongmuoi.favorites') || '[]'); if (!Array.isArray(ids)) ids = []; } catch { ids = []; } const favorites = state.looks.map((look, index) => ids.includes(look.id) ? index : -1).filter(index => index >= 0); if (!favorites.length) return toast('Bạn chưa lưu bộ phối nào.'); const next = favorites.find(index => index > state.index) ?? favorites[0]; setLook(next); });
  document.addEventListener('click', event => { const backdrop = $('#product-detail'); if (!backdrop || backdrop.hidden) return; if (event.target === backdrop || event.target.closest('[data-detail-close]')) { backdrop.hidden = true; document.body.classList.remove('modal-open'); return; } const link = event.target.closest('[data-detail-look]'); if (link) { backdrop.hidden = true; document.body.classList.remove('modal-open'); setLook(Number(link.dataset.detailLook)); return; } const add = event.target.closest('[data-detail-add]'); if (add) { const qty = Math.max(1, Math.floor(Number($('#detail-qty').value) || 1)); addCart(add.dataset.detailAdd, $('#detail-size').value, qty); } });
  $('#customize-look').addEventListener('click', event => { event.stopImmediatePropagation(); const look = state.looks[state.index]; let saved; try { saved = JSON.parse(localStorage.getItem('huongmuoi.favorites') || '[]'); if (!Array.isArray(saved)) saved = []; } catch { saved = []; } const exists = saved.includes(look.id); saved = exists ? saved.filter(id => id !== look.id) : [...saved, look.id]; localStorage.setItem('huongmuoi.favorites', JSON.stringify(saved)); toast(exists ? 'Đã bỏ bộ phối khỏi yêu thích.' : 'Đã lưu bộ phối yêu thích trên trình duyệt này.'); }, true);
  $('#look-prev').addEventListener('click', () => setLook(state.index - 1)); $('#look-next').addEventListener('click', () => setLook(state.index + 1));
  $('#look-play').addEventListener('click', () => { state.playing = !state.playing; $('#look-play').setAttribute('aria-pressed', String(state.playing)); $('#look-play').setAttribute('aria-label', state.playing ? 'Tạm dừng chuyển look' : 'Tự động chuyển look'); $('#play-icon').textContent = state.playing ? 'Ⅱ' : '▶'; renderProgress(); restartAutoplay(); });
  $('#look-progress').addEventListener('click', event => { const button = event.target.closest('[data-look]'); if (button) setLook(Number(button.dataset.look)); });
  $('#runway-stage').addEventListener('keydown', event => { if (event.key === 'ArrowRight') { event.preventDefault(); setLook(state.index + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); setLook(state.index - 1); } });
  let startX = null, lastStageDragAt = 0; $('#runway-stage').addEventListener('pointerdown', event => { if (event.target.closest('button:not(.model-view),a')) return; startX = event.clientX; }); $('#runway-stage').addEventListener('pointerup', event => { if (startX == null) return; const difference = event.clientX - startX; startX = null; if (Math.abs(difference) > 45) { lastStageDragAt = Date.now(); setLook(state.index + (difference < 0 ? 1 : -1)); } });
  $('#look-products').addEventListener('click', event => { const open = event.target.closest('[data-open-category]'); if (open) { setCategory(open.dataset.openCategory); $('#hero-wardrobe').scrollIntoView({ block: 'nearest' }); return; } const button = event.target.closest('[data-add-mini]'); if (!button) return; const row = button.closest('.look-product'); addCart(button.dataset.addMini, $('.mini-size', row).value); });
  $('#add-look').addEventListener('click', () => addMany($$('.look-product').map(row => ({ id: row.dataset.product, size: $('.mini-size', row).value, qty: 1 }))));
  $('#customize-look').addEventListener('click', () => { pauseAutoplay(); state.selection = { top: null, bottom: null, shoes: null }; saveCurrentEdit(); renderModels(); renderLook(); renderBuilder(); toast('Người mẫu đã sẵn sàng cho set mới.'); });
  $('#gender-tabs').addEventListener('click', event => { const btn = event.target.closest('[data-gender]'); if (btn) setGender(btn.dataset.gender); });
  $('#hero-gender-tabs').addEventListener('click', event => { const btn = event.target.closest('[data-hero-gender]'); if (btn) setGender(btn.dataset.heroGender); });
  $('#category-tabs').addEventListener('click', event => { const btn = event.target.closest('[data-category]'); if (btn) setCategory(btn.dataset.category); });
  $('#hero-category-tabs').addEventListener('click', event => { const btn = event.target.closest('[data-hero-category]'); if (btn) setCategory(btn.dataset.heroCategory); });
  $('#product-search').addEventListener('input', renderWardrobe); $('#hero-search-input').addEventListener('input', renderHeroWardrobe);
  $('#search-toggle').addEventListener('click', () => { $('#phoi-do').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#hero-search-input').focus(), 450); });
  $('#size-options').addEventListener('click', event => { const btn = event.target.closest('[data-size]'); if (btn) setSize(btn.dataset.size); });
  $('#hero-size-options').addEventListener('click', event => { const btn = event.target.closest('[data-hero-size]'); if (btn) setSize(btn.dataset.heroSize); });
  $('#hero-wardrobe').addEventListener('click', event => { const btn = event.target.closest('[data-hero-try]'); if (btn) chooseProduct(btn.dataset.heroTry); });
  $('#hero-wardrobe').addEventListener('keydown', event => { const card = event.target.closest('[data-hero-drag]'); if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); chooseProduct(card.dataset.heroDrag); } });
  $('#hero-wardrobe').addEventListener('dragstart', event => { const card = event.target.closest('[data-hero-drag]'); if (card) { event.dataTransfer.setData('text/plain', card.dataset.heroDrag); event.dataTransfer.effectAllowed = 'copy'; clearInterval(state.timer); } });
  $('#hero-wardrobe').addEventListener('dragend', () => { $('#runway-stage').classList.remove('drag-over'); restartAutoplay(); });
  $('#runway-models').addEventListener('click', event => { const pin = event.target.closest('[data-pin-category]'); if (pin) { const p = product(state.selection[pin.dataset.pinCategory]); if (p) chooseProduct(p.id); return; } if (event.target.closest('[data-view-active]') && Date.now() - lastStageDragAt > 120) openLookModal(); });
  $('#runway-stage').addEventListener('dragover', event => { event.preventDefault(); $('#runway-stage').classList.add('drag-over'); event.dataTransfer.dropEffect = 'copy'; });
  $('#runway-stage').addEventListener('dragleave', event => { if (!$('#runway-stage').contains(event.relatedTarget)) $('#runway-stage').classList.remove('drag-over'); });
  $('#runway-stage').addEventListener('drop', event => { event.preventDefault(); $('#runway-stage').classList.remove('drag-over'); chooseProduct(event.dataTransfer.getData('text/plain')); });
  $('#wardrobe-list').addEventListener('click', event => { const btn = event.target.closest('[data-try]'); if (btn) chooseProduct(btn.dataset.try); });
  $('#wardrobe-list').addEventListener('keydown', event => { const item = event.target.closest('[data-drag-id]'); if (item && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); chooseProduct(item.dataset.dragId); } });
  $('#wardrobe-list').addEventListener('dragstart', event => { const item = event.target.closest('[data-drag-id]'); if (item) { event.dataTransfer.setData('text/plain', item.dataset.dragId); event.dataTransfer.effectAllowed = 'copy'; } });
  const drop = $('#tryon-drop'); drop.addEventListener('dragover', event => { event.preventDefault(); drop.classList.add('drag-over'); event.dataTransfer.dropEffect = 'copy'; }); drop.addEventListener('dragleave', event => { if (!drop.contains(event.relatedTarget)) drop.classList.remove('drag-over'); }); drop.addEventListener('drop', event => { event.preventDefault(); drop.classList.remove('drag-over'); chooseProduct(event.dataTransfer.getData('text/plain')); });
  $('#selected-slots').addEventListener('click', event => { const btn = event.target.closest('[data-remove-slot]'); if (!btn) return; state.selection[btn.dataset.removeSlot] = null; renderBuilder(); });
  $('#add-selection').addEventListener('click', () => addMany(Object.values(state.selection).filter(Boolean).map(id => ({ id, size: state.size, qty: 1 }))));
  $('#reset-selection').addEventListener('click', () => { state.selection = { top: null, bottom: null, shoes: null }; renderBuilder(); toast('Đã làm mới set đồ.'); });
  $('#featured-products').addEventListener('click', event => { const add = event.target.closest('[data-feature-add]'); if (add) { const card = add.closest('[data-feature]'); addCart(add.dataset.featureAdd, card.querySelector('.feature-size').value); return; } const tryButton = event.target.closest('[data-feature-try]'); if (tryButton) featureToBuilder(tryButton.dataset.featureTry); });
  $('#editorial-grid').addEventListener('click', event => { const button = event.target.closest('[data-inspiration]'); if (!button) return; setLook(Number(button.dataset.inspiration)); $('#phoi-do').scrollIntoView({ behavior: 'smooth' }); });
  $('#close-look-modal').addEventListener('click', closeLookModal);
  $('#look-modal').addEventListener('click', event => { if (event.target.id === 'look-modal') closeLookModal(); });
  $('#look-modal-stage').addEventListener('click', event => { const pin = event.target.closest('[data-modal-pin]'); if (!pin) return; $$('.modal-product').forEach(row => row.classList.toggle('highlighted', row.dataset.modalCategory === pin.dataset.modalPin)); $(`.modal-product[data-modal-category="${pin.dataset.modalPin}"]`)?.scrollIntoView({ block: 'nearest' }); });
  $('#modal-look-products').addEventListener('click', event => { const button = event.target.closest('[data-modal-add]'); if (!button) return; const row = button.closest('.modal-product'); addCart(button.dataset.modalAdd, $('select', row).value); });
  $('#modal-add-look').addEventListener('click', () => { const items = $$('.modal-product').map(row => ({ id: row.dataset.modalProduct, size: $('select', row).value, qty: 1 })); closeLookModal(); addMany(items); });
  $$('.bag-trigger').forEach(btn => btn.addEventListener('click', openCart)); $('#drawer-backdrop').addEventListener('click', closeCart); $('#close-cart').addEventListener('click', closeCart);
  $('#cart-items').addEventListener('click', event => { const remove = event.target.closest('[data-cart-remove]'); if (remove) { state.cart.splice(Number(remove.dataset.cartRemove), 1); return persistCart(); } const qty = event.target.closest('[data-cart-qty]'); if (!qty) return; const item = state.cart[Number(qty.dataset.cartQty)]; const next = item.qty + Number(qty.dataset.change); if (next <= 0) state.cart.splice(Number(qty.dataset.cartQty), 1); else if (next <= (product(item.id)?.sizes?.[item.size] || 0)) item.qty = next; else return toast('Số lượng vượt quá tồn kho hiện tại.'); persistCart(); });
  $('#checkout-button').addEventListener('click', openCheckout); $('#close-checkout').addEventListener('click', closeCheckout); $('#checkout-backdrop').addEventListener('click', event => { if (event.target.id === 'checkout-backdrop') closeCheckout(); }); document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeLookModal(); closeCart(); closeCheckout(); } });
  $('#checkout-form').addEventListener('submit', async event => { event.preventDefault(); const button = $('#checkout-form button[type="submit"]'); const fields = new FormData(event.target); const customer = { name: String(fields.get('name')).trim(), phone: String(fields.get('phone')).trim(), address: String(fields.get('address')).trim() }; if (!customer.name || !customer.phone || !customer.address) return; button.disabled = true; button.firstChild.textContent = 'Đang lưu đơn... '; try { const result = await shopStore.submitOrder(customer, state.cart); state.cart = []; persistCart(); closeCheckout(); event.target.reset(); toast(`Đã tạo đơn ${result.code}${result.demo ? ' trên trình duyệt này (demo)' : ''}.`); } catch (error) { toast(error.message || 'Không tạo được đơn. Vui lòng thử lại.'); } finally { button.disabled = false; button.firstChild.textContent = shopStore.live ? 'Đặt hàng COD ' : 'Lưu đơn hàng mẫu '; } });
}
function featureToBuilder(id) { if (product(id)) chooseProduct(id); }
async function init() {
  try { const catalog = await shopStore.loadCatalog(); state.products = catalog.products; state.looks = catalog.looks; } catch (error) { toast(error.message); return; }
  state.looks = state.looks.map(look => ({ ...look, lookId: look.id, modelId: look.modelId || `model-${look.id}`, modelImage: look.image, previewStatus: look.image ? 'completed' : 'unavailable' }));
  state.lookEdits = state.looks.map(look => { const selection = { top: null, bottom: null, shoes: null }; look.products.forEach(id => { const p = product(id); if (p) selection[p.category] = id; }); return { gender: look.gender, selection }; });
  try { const saved = JSON.parse(localStorage.getItem('huongmuoi.fitting') || 'null'); if (sizes.includes(saved?.size)) state.size = saved.size; if (Number.isInteger(saved?.index) && saved.index >= 0 && saved.index < state.looks.length) state.index = saved.index; } catch { /* use default looks */ }
  state.gender = state.lookEdits[state.index].gender; state.selection = { ...state.lookEdits[state.index].selection };
  try { state.cart = JSON.parse(localStorage.getItem('huongmuoi.cart') || '[]').filter(item => product(item.id)); } catch { state.cart = []; }
  renderModels(); renderLook(); renderWardrobe(); renderBuilder(); renderFeatured(); renderEditorial(); renderCart(); bindEvents(); restartAutoplay();
  if (shopStore.live) { $('.checkout-modal .eyebrow').lastChild.textContent = ' ĐẶT HÀNG COD'; $('.checkout-modal>p').textContent = 'Đơn hàng sẽ được gửi tới Hương Muối. Shop sẽ liên hệ xác nhận và giao hàng COD.'; $('#checkout-form button[type="submit"]').firstChild.textContent = 'Đặt hàng COD '; $('#footer-mode-note').textContent = 'Shop nhận đơn COD trực tuyến. Hương Muối sẽ liên hệ xác nhận sau khi bạn đặt hàng.'; }
}
init();
