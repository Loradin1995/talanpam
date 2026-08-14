// Prisma Decimal ak BigInt yo pa serialize byen an JSON pa defo (Decimal → string,
// BigInt → erè). Middleware sa a konvèti yo an nimewo JS nòmal AVAN `res.json()`
// voye repons lan, pou frontend lan toujou resevwa vrè `number` (pa `string`) e ka
// itilize `.toFixed()`/`.toLocaleString()` san danje.
function deepConvert(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(deepConvert);
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'object') {
    if (typeof value.toNumber === 'function' && typeof value.toFixed === 'function' && value.constructor?.name === 'Decimal') {
      return value.toNumber();
    }
    if (value instanceof Date) return value;
    const out = {};
    for (const key of Object.keys(value)) out[key] = deepConvert(value[key]);
    return out;
  }
  return value;
}

export function serializeJson(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(deepConvert(body));
  next();
}
