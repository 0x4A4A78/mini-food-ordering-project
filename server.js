const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createOrder, updateStatus, validateTable, MENU } = require('./src/orders');

const root = __dirname;
const publicDir = fs.existsSync(path.join(root, 'dist')) ? path.join(root, 'dist') : path.join(root, 'public');
const dataFile = process.env.DATA_FILE || path.join(root, 'data', 'orders.json');
const port = Number(process.env.PORT || 3000);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function readOrders() {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')).filter(order => Number.isInteger(order.table)); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
function saveOrders(orders) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(orders, null, 2));
}
function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
function body(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 100000) { reject(new Error('คำขอใหญ่เกินไป')); req.destroy(); } });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('ข้อมูล JSON ไม่ถูกต้อง')); } });
    req.on('error', reject);
  });
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/health') return send(res, 200, { ok: true });
    if (url.pathname === '/api/menu' && req.method === 'GET') return send(res, 200, MENU);
    if (url.pathname === '/api/orders' && req.method === 'GET') {
      const orders = readOrders();
      return send(res, 200, url.searchParams.has('table') ? orders.filter(order => order.table === validateTable(url.searchParams.get('table'))) : orders);
    }
    if (url.pathname === '/api/orders' && req.method === 'POST') {
      const orders = readOrders();
      const order = createOrder(await body(req), orders);
      orders.unshift(order); saveOrders(orders);
      return send(res, 201, order);
    }
    const statusMatch = url.pathname.match(/^\/api\/orders\/([a-z0-9-]+)\/status$/i);
    if (statusMatch && req.method === 'PATCH') {
      const orders = readOrders();
      const order = orders.find(item => item.id === statusMatch[1]);
      if (!order) return send(res, 404, { error: 'ไม่พบคำสั่งซื้อ' });
      updateStatus(order, (await body(req)).status); saveOrders(orders);
      return send(res, 200, order);
    }
    if (url.pathname.startsWith('/api/')) return send(res, 404, { error: 'ไม่พบ API' });
    const file = path.resolve(publicDir, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(publicDir + path.sep) && file !== path.join(publicDir, 'index.html')) return send(res, 403, { error: 'ห้ามเข้าถึง' });
    fs.readFile(file, (error, content) => {
      if (error) return send(res, 404, { error: 'ไม่พบหน้า' });
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(content);
    });
  } catch (error) { send(res, 400, { error: error.message }); }
});
if (require.main === module) server.listen(port, () => console.log(`Food ordering: http://localhost:${port}`));
module.exports = server;
