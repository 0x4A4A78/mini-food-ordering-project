const test = require('node:test');
const assert = require('node:assert/strict');
const { createOrder, updateStatus } = require('../src/orders');
test('สร้างออเดอร์และคำนวณราคาจากเมนูฝั่งเซิร์ฟเวอร์', () => {
  const order = createOrder({ customer: 'สมชาย', items: [{ id: 'rice-basil', quantity: 2, price: 1 }] });
  assert.equal(order.total, 130);
  assert.equal(order.status, 'รอรับออเดอร์');
});
test('ปฏิเสธอาหารที่ไม่มีในเมนูและตะกร้าว่าง', () => {
  assert.throws(() => createOrder({ customer: 'A', items: [] }));
  assert.throws(() => createOrder({ customer: 'A', items: [{ id: 'bad', quantity: 1 }] }));
});
test('เปลี่ยนสถานะตามลำดับ', () => {
  const order = createOrder({ customer: 'A', items: [{ id: 'tea', quantity: 1 }] });
  assert.throws(() => updateStatus(order, 'เสร็จแล้ว'));
  updateStatus(order, 'กำลังทำ'); updateStatus(order, 'เสร็จแล้ว');
  assert.equal(order.status, 'เสร็จแล้ว');
});
