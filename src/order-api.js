const { createOrder, updateStatus, validateTable, MENU } = require('./orders');

function send(res, code, body) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (Number(req.headers['content-length']) > 100000) throw new Error('คำขอใหญ่เกินไป');
  if ('body' in req && req.headers['content-type']?.split(';')[0] === 'application/json') {
    try { return req.body ?? {}; }
    catch { throw new Error('ข้อมูล JSON ไม่ถูกต้อง'); }
  }
  req.setEncoding('utf8');
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 100000) throw new Error('คำขอใหญ่เกินไป');
  }
  try { return JSON.parse(raw || '{}'); }
  catch { throw new Error('ข้อมูล JSON ไม่ถูกต้อง'); }
}

function createOrderApi({ readOrders, changeOrders }) {
  return async (req, res, url) => {
    try {
      if (url.pathname === '/api/health') return send(res, 200, { ok: true });
      if (url.pathname === '/api/menu' && req.method === 'GET') return send(res, 200, MENU);
      if (url.pathname === '/api/orders' && req.method === 'GET') {
        const orders = await readOrders();
        return send(res, 200, url.searchParams.has('table') ? orders.filter(order => order.table === validateTable(url.searchParams.get('table'))) : orders);
      }
      if (url.pathname === '/api/orders' && req.method === 'POST') {
        const input = await readBody(req);
        const order = await changeOrders(orders => {
          const order = createOrder(input, orders);
          orders.unshift(order);
          return order;
        });
        return send(res, 201, order);
      }
      const statusMatch = url.pathname.match(/^\/api\/orders\/([a-z0-9-]+)\/status$/i);
      if (statusMatch && req.method === 'PATCH') {
        const { status } = await readBody(req);
        const order = await changeOrders(orders => {
          const order = orders.find(item => item.id === statusMatch[1]);
          if (!order) return null;
          updateStatus(order, status);
          return order;
        });
        return order ? send(res, 200, order) : send(res, 404, { error: 'ไม่พบคำสั่งซื้อ' });
      }
      return send(res, 404, { error: 'ไม่พบ API' });
    } catch (error) {
      return send(res, error.statusCode || 400, { error: error.message });
    }
  };
}

module.exports = { createOrderApi, send };
