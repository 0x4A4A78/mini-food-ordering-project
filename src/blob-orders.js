const { get, put, BlobPreconditionFailedError } = require('@vercel/blob');

const pathname = process.env.VERCEL_ENV === 'production' ? 'orders.json' : 'preview/orders.json';
const options = { access: 'private' };

function storageError(error) {
  console.error('Order storage request failed', error.name);
  return Object.assign(new Error('จัดเก็บออเดอร์ไม่สำเร็จ กรุณาลองอีกครั้ง'), { statusCode: 503 });
}

async function readSnapshot() {
  try {
    const result = await get(pathname, { ...options, useCache: false });
    if (!result) return { orders: [], etag: null };
    return { orders: await new Response(result.stream).json(), etag: result.blob.etag };
  } catch (error) {
    throw storageError(error);
  }
}

async function readOrders() {
  return (await readSnapshot()).orders;
}

async function changeOrders(change) {
  let snapshot = await readSnapshot();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { orders, etag } = snapshot;
    const result = change(orders);
    if (result === null) return null;
    try {
      await put(pathname, JSON.stringify(orders), {
        ...options,
        contentType: 'application/json',
        ...(etag ? { ifMatch: etag } : { allowOverwrite: false })
      });
      return result;
    } catch (error) {
      if (etag && !(error instanceof BlobPreconditionFailedError)) throw storageError(error);
      snapshot = await readSnapshot();
      if (!snapshot.etag) throw storageError(error);
    }
  }
  throw storageError(new Error('Concurrent order updates'));
}

module.exports = { readOrders, changeOrders };
