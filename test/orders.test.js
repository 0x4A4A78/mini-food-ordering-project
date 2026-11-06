const test = require('node:test');
const assert = require('node:assert/strict');
const { createOrder, updateStatus, validateTable } = require('../src/orders');

test('ส่งออเดอร์โต๊ะและนับจำนวนจานโดยไม่คิดราคาแยก', () => {
  const order = createOrder({ table: 4, items: [{ id: 'pork-sliced', quantity: 2 }] });
  assert.equal(order.table, 4);
  assert.equal(order.round, 1);
  assert.equal(order.itemCount, 2);
  assert.equal(order.status, 'ส่งเข้าครัวแล้ว');
  assert.equal('total' in order, false);
});
test('สั่งเพิ่มโต๊ะเดิมเป็นรอบถัดไป', () => {
  const first = createOrder({ table: 4, items: [{ id: 'shrimp', quantity: 1 }] });
  const second = createOrder({ table: 4, items: [{ id: 'rice', quantity: 1 }] }, [first]);
  assert.equal(second.round, 2);
});
test('ปฏิเสธโต๊ะและจำนวนที่ไม่ถูกต้อง', () => {
  assert.throws(() => validateTable(0));
  assert.throws(() => createOrder({ table: 31, items: [{ id: 'tea', quantity: 1 }] }));
  assert.throws(() => createOrder({ table: 1, items: [] }));
  assert.throws(() => createOrder({ table: 1, items: [{ id: 'bad', quantity: 1 }] }));
  assert.throws(() => createOrder({ table: 1, items: [{ id: 'tea', quantity: 11 }] }));
});
test('ครัวเปลี่ยนสถานะตามลำดับ', () => {
  const order = createOrder({ table: 1, items: [{ id: 'tea', quantity: 1 }] });
  assert.throws(() => updateStatus(order, 'เสิร์ฟแล้ว'));
  updateStatus(order, 'กำลังเตรียม'); updateStatus(order, 'เสิร์ฟแล้ว');
  assert.equal(order.status, 'เสิร์ฟแล้ว');
});
