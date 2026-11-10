const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createOrderApi, send } = require('./src/order-api');

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
function changeOrders(change) {
  const orders = readOrders();
  const result = change(orders);
  if (result !== null) saveOrders(orders);
  return result;
}
const handleOrderApi = createOrderApi({ readOrders, changeOrders });

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return await handleOrderApi(req, res, url);
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
