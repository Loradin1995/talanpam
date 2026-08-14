export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  if (err.status) return res.status(err.status).json({ error: err.message || 'error' });
  res.status(500).json({ error: 'internal_server_error' });
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
