const { randomUUID } = require('node:crypto');

const MENU = [
  { id: 'pork-sliced', name: 'หมูสไลซ์', category: 'เนื้อสัตว์', unit: 'ถาด', accent: '#e9b1a2' },
  { id: 'pork-marinated', name: 'หมูหมักนุ่ม', category: 'เนื้อสัตว์', unit: 'ถาด', accent: '#d99583' },
  { id: 'beef-sliced', name: 'เนื้อสไลซ์', category: 'เนื้อสัตว์', unit: 'ถาด', accent: '#bd7568' },
  { id: 'chicken', name: 'ไก่หมักงา', category: 'เนื้อสัตว์', unit: 'ถาด', accent: '#e2b98e' },
  { id: 'shrimp', name: 'กุ้งสด', category: 'ทะเล', unit: 'จาน', accent: '#e99d81' },
  { id: 'squid', name: 'ปลาหมึกสด', category: 'ทะเล', unit: 'จาน', accent: '#d4b8a2' },
  { id: 'fish-ball', name: 'ลูกชิ้นปลา', category: 'ลูกชิ้น', unit: 'จาน', accent: '#dfd7b6' },
  { id: 'pork-ball', name: 'ลูกชิ้นหมู', category: 'ลูกชิ้น', unit: 'จาน', accent: '#d4ac95' },
  { id: 'cabbage', name: 'ผักกาดขาว', category: 'ผักและเห็ด', unit: 'จาน', accent: '#c9dba5' },
  { id: 'morning-glory', name: 'ผักบุ้ง', category: 'ผักและเห็ด', unit: 'จาน', accent: '#97bd82' },
  { id: 'enoki', name: 'เห็ดเข็มทอง', category: 'ผักและเห็ด', unit: 'จาน', accent: '#e6d8ad' },
  { id: 'glass-noodles', name: 'วุ้นเส้น', category: 'เส้นและข้าว', unit: 'จาน', accent: '#e2d5bc' },
  { id: 'jade-noodles', name: 'บะหมี่หยก', category: 'เส้นและข้าว', unit: 'จาน', accent: '#a6c898' },
  { id: 'rice', name: 'ข้าวสวย', category: 'เส้นและข้าว', unit: 'ถ้วย', accent: '#e8dfc8' },
  { id: 'tea', name: 'ชาไทย', category: 'เครื่องดื่ม', unit: 'แก้ว', accent: '#dca56d' },
  { id: 'water', name: 'น้ำเปล่า', category: 'เครื่องดื่ม', unit: 'ขวด', accent: '#a6c5c8' }
];
const statuses = ['ส่งเข้าครัวแล้ว', 'กำลังเตรียม', 'เสิร์ฟแล้ว'];

function validateTable(value) {
  const table = Number(value);
  if (!Number.isInteger(table) || table < 1 || table > 30) throw new Error('กรุณาเลือกโต๊ะ 1–30');
  return table;
}
function createOrder(input, existing = []) {
  const table = validateTable(input.table);
  if (!Array.isArray(input.items) || !input.items.length) throw new Error('กรุณาเลือกอาหารอย่างน้อย 1 รายการ');
  const items = input.items.map(item => {
    const menu = MENU.find(m => m.id === item.id);
    const quantity = Number(item.quantity);
    if (!menu || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('รายการอาหารหรือจำนวนไม่ถูกต้อง');
    return { id: menu.id, name: menu.name, unit: menu.unit, quantity };
  });
  const round = existing.filter(order => order.table === table).length + 1;
  return { id: randomUUID(), table, round, items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), status: statuses[0], createdAt: new Date().toISOString() };
}
function updateStatus(order, status) {
  const current = statuses.indexOf(order.status), next = statuses.indexOf(status);
  if (next !== current + 1) throw new Error('เปลี่ยนสถานะได้ตามลำดับเท่านั้น');
  order.status = status;
  return order;
}
module.exports = { MENU, createOrder, updateStatus, validateTable, statuses };
