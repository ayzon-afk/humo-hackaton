export function apiNotFound(req, res) {
  res.status(404).json({ error: `Маршрут не найден: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  console.error('❌', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Ошибка сервера' });
}
