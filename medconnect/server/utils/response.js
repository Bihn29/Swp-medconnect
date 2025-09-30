/**
 * Standard response utilities
 */
export function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, code, message });
}

export function ok(res, data = {}) {
  return res.json({ ok: true, ...data });
}
