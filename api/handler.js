const { createOrderApi } = require('../src/order-api');
const { readOrders, changeOrders } = require('../src/blob-orders');

const handleOrderApi = createOrderApi({ readOrders, changeOrders });

module.exports = (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/handler' && url.searchParams.has('__route')) {
    url.pathname = '/api/' + url.searchParams.get('__route');
  }
  return handleOrderApi(req, res, url);
};
