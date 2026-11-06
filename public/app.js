const $ = selector => document.querySelector(selector);
const state = { menu: [], cart: {}, category: 'ทั้งหมด', table: null, page: 'menu' };
const categories = ['ทั้งหมด', 'เนื้อสัตว์', 'ทะเล', 'ลูกชิ้น', 'ผักและเห็ด', 'เส้นและข้าว', 'เครื่องดื่ม'];
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
async function api(url, options) { const response = await fetch(url, options); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง'); return data; }
function setMessage(text, error = false) { const node = $('#order-message'); node.textContent = text; node.classList.toggle('error', error); }
function setupTable() {
  $('#table-number').innerHTML = Array.from({ length: 30 }, (_, index) => `<option value="${index + 1}">โต๊ะ ${String(index + 1).padStart(2, '0')}</option>`).join('');
  const param = Number(new URLSearchParams(location.search).get('table'));
  const saved = Number(localStorage.getItem('buffetTable'));
  state.table = Number.isInteger(param) && param >= 1 && param <= 30 ? param : Number.isInteger(saved) && saved >= 1 && saved <= 30 ? saved : null;
  if (state.table) setTable(state.table); else $('#table-dialog').showModal();
}
function setTable(table) {
  state.table = table;
  localStorage.setItem('buffetTable', String(table));
  history.replaceState(null, '', `?table=${table}`);
  $('#table-chip').textContent = `โต๊ะ ${String(table).padStart(2, '0')} · พร้อมสั่ง`;
  $('#table-number').value = String(table);
}
function renderCategories() { $('#categories').innerHTML = categories.map(category => `<button class="category ${category === state.category ? 'selected' : ''}" data-category="${category}" aria-pressed="${category === state.category}">${category}</button>`).join(''); }
function renderMenu() {
  const items = state.category === 'ทั้งหมด' ? state.menu : state.menu.filter(item => item.category === state.category);
  $('#menu-count').textContent = `${items.length} รายการ`;
  $('#menu-grid').innerHTML = items.map((item, index) => `<article class="menu-item"><div class="dish-art" style="--dish:${item.accent}" aria-hidden="true"><span class="dish-plate"><span class="dish-food"></span></span></div><div class="dish-copy"><span>${item.category} · ${item.unit}</span><h3>${escapeHtml(item.name)}</h3><div class="dish-action"><span>รวมในบุฟเฟต์</span><button class="add-button" data-add="${item.id}" aria-label="เพิ่ม ${escapeHtml(item.name)}">เพิ่ม <b>+</b></button></div></div></article>`).join('');
}
function renderCart() {
  const items = state.menu.filter(item => state.cart[item.id]);
  const count = items.reduce((sum, item) => sum + state.cart[item.id], 0);
  $('#cart-items').innerHTML = items.length ? items.map(item => `<div class="cart-row"><div><strong>${escapeHtml(item.name)}</strong><small>${item.unit}</small></div><div class="stepper"><button data-minus="${item.id}" aria-label="ลด ${escapeHtml(item.name)}">−</button><span>${state.cart[item.id]}</span><button data-add="${item.id}" aria-label="เพิ่ม ${escapeHtml(item.name)}">+</button></div></div>`).join('') : '<div class="cart-empty"><span class="empty-line"></span><strong>ยังไม่มีรายการในรอบนี้</strong><p>เลือกเมนูด้านซ้ายเพื่อเริ่มสั่ง</p></div>';
  $('#cart-count').textContent = count;
  $('#item-total').textContent = `${count} จาน`;
  $('#mobile-count').textContent = `${count} จาน`;
  $('#mobile-cart-bar').hidden = count === 0 || state.page !== 'menu';
  $('#send-order').disabled = !count || !state.table;
}
function orderCard(order, kitchen) {
  const next = order.status === 'ส่งเข้าครัวแล้ว' ? 'กำลังเตรียม' : order.status === 'กำลังเตรียม' ? 'เสิร์ฟแล้ว' : null;
  return `<article class="order-card"><div class="order-card-top"><div><span class="order-round">โต๊ะ ${String(order.table).padStart(2, '0')} · รอบที่ ${order.round}</span><h2>${order.itemCount} จาน <small>· ${new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</small></h2></div><span class="status ${order.status === 'เสิร์ฟแล้ว' ? 'served' : order.status === 'กำลังเตรียม' ? 'preparing' : ''}">${order.status}</span></div><div class="order-items">${order.items.map(item => `<span>${escapeHtml(item.name)} × ${item.quantity}</span>`).join('')}</div>${kitchen && next ? `<button class="button-outline" data-status="${order.id}" data-next="${next}">เปลี่ยนเป็น ${next}</button>` : ''}</article>`;
}
async function refreshOrders() {
  if (state.table) { const mine = await api(`/api/orders?table=${state.table}`); $('#history-list').innerHTML = mine.map(order => orderCard(order, false)).join('') || '<div class="list-empty">ยังไม่มีรายการของโต๊ะนี้<br>เริ่มเลือกอาหารแล้วส่งเข้าครัวได้เลย</div>'; }
  const all = await api('/api/orders');
  $('#kitchen-list').innerHTML = all.map(order => orderCard(order, true)).join('') || '<div class="list-empty">ยังไม่มีรายการจากลูกค้า</div>';
}
function showPage(page) {
  state.page = page;
  document.querySelectorAll('.page').forEach(section => section.hidden = section.id !== page);
  document.querySelectorAll('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  $('#mobile-cart-bar').hidden = page !== 'menu' || !Object.values(state.cart).some(Boolean);
  if (page !== 'menu') refreshOrders().catch(error => { $(`#${page === 'history' ? 'history' : 'kitchen'}-list`).textContent = error.message; });
  window.scrollTo(0, 0);
}
document.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button) return;
  const { add, minus, category, page, status, next } = button.dataset;
  if (add) { state.cart[add] = Math.min((state.cart[add] || 0) + 1, 10); renderCart(); setMessage(''); }
  if (minus) { state.cart[minus]--; if (!state.cart[minus]) delete state.cart[minus]; renderCart(); }
  if (category) { state.category = category; renderCategories(); renderMenu(); }
  if (page) showPage(page);
  if (status) { try { await api(`/api/orders/${status}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) }); await refreshOrders(); } catch (error) { alert(error.message); } }
});
$('#confirm-table').addEventListener('click', event => { const table = Number($('#table-number').value); if (!Number.isInteger(table) || table < 1 || table > 30) { event.preventDefault(); $('#table-error').textContent = 'กรุณาเลือกโต๊ะ 1–30'; return; } setTable(table); renderCart(); });
$('#change-table').addEventListener('click', () => $('#table-dialog').showModal());
$('#send-order').addEventListener('click', async () => {
  const button = $('#send-order'); button.disabled = true; button.textContent = 'กำลังส่งรายการ…'; setMessage('');
  try { const items = Object.entries(state.cart).map(([id, quantity]) => ({ id, quantity })); const order = await api('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: state.table, items }) }); state.cart = {}; renderCart(); setMessage(`ส่งเข้าครัวแล้ว · รอบที่ ${order.round}`); showPage('history'); }
  catch (error) { setMessage(error.message, true); }
  finally { button.textContent = 'ส่งรายการเข้าครัว ↗'; renderCart(); }
});
$('#refresh-history').onclick = () => refreshOrders().catch(error => alert(error.message));
$('#refresh-kitchen').onclick = () => refreshOrders().catch(error => alert(error.message));
$('#open-cart').onclick = () => $('#cart').scrollIntoView({ behavior: 'smooth', block: 'start' });
setupTable(); renderCategories();
api('/api/menu').then(menu => { state.menu = menu; renderMenu(); renderCart(); }).catch(error => { $('#menu-grid').textContent = error.message; });
