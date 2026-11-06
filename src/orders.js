const { randomUUID } = require('node:crypto');
const MENU = [
  { id: 'rice-basil', name: 'ข้าวกะเพราไก่', price: 65, icon: '🍳', category: 'จานหลัก' },
  { id: 'rice-pork', name: 'ข้าวหมูทอดกระเทียม', price: 70, icon: '🍚', category: 'จานหลัก' },
  { id: 'fried-rice', name: 'ข้าวผัดกุ้ง', price: 85, icon: '🍤', category: 'จานหลัก' },
  { id: 'tom-yum', name: 'ต้มยำกุ้ง', price: 120, icon: '🍲', category: 'กับข้าว' },
  { id: 'tea', name: 'ชาไทย', price: 40, icon: '🧋', category: 'เครื่องดื่ม' },
  { id: 'water', name: 'น้ำเปล่า', price: 15, icon: '💧', category: 'เครื่องดื่ม' }
];
const statuses = ['รอรับออเดอร์', 'กำลังทำ', 'เสร็จแล้ว'];
function createOrder(input) {
  const customer = String(input.customer || '').trim();
  if (!customer || customer.length > 60) throw new Error('กรุณากรอกชื่อผู้สั่ง (ไม่เกิน 60 ตัวอักษร)');
  if (!Array.isArray(input.items) || !input.items.length) throw new Error('กรุณาเลือกอาหารอย่างน้อย 1 รายการ');
  const items = input.items.map(item => {
    const menu = MENU.find(m => m.id === item.id);
    const quantity = Number(item.quantity);
    if (!menu || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('รายการอาหารหรือจำนวนไม่ถูกต้อง');
    return { id: menu.id, name: menu.name, price: menu.price, quantity, subtotal: menu.price * quantity };
  });
  return { id: randomUUID(), customer, items, total: items.reduce((sum, item) => sum + item.subtotal, 0), status: statuses[0], createdAt: new Date().toISOString() };
}
function updateStatus(order, status) {
  const current = statuses.indexOf(order.status), next = statuses.indexOf(status);
  if (next !== current + 1) throw new Error('เปลี่ยนสถานะได้ตามลำดับเท่านั้น');
  order.status = status;
  return order;
}
module.exports = { MENU, createOrder, updateStatus };
