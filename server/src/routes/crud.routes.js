import { Router } from 'express';
import { collection } from '../db/store.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { emit } from '../realtime/socket.js';

const SEARCH_FIELDS = ['title', 'description', 'category'];

function applyQuery(items, query) {
  const { q, sort = '-createdAt', limit, ...filters } = query;
  let result = items.filter((item) =>
    Object.entries(filters).every(([key, value]) => String(item[key]) === String(value)),
  );
  if (q) {
    const needle = String(q).toLowerCase();
    result = result.filter((item) =>
      SEARCH_FIELDS.some((f) => String(item[f] ?? '').toLowerCase().includes(needle)),
    );
  }
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  result.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (desc ? -1 : 1));
  return limit ? result.slice(0, Number(limit)) : result;
}

/** Универсальный CRUD для любой коллекции + realtime-события `${name}:created|updated|deleted` */
export function createCrudRouter(name) {
  const router = Router();
  const col = () => collection(name);

  router.get('/', (req, res) => res.json(applyQuery(col().all(), req.query)));

  router.get('/:id', (req, res) => {
    const item = col().byId(req.params.id);
    if (!item) return res.status(404).json({ error: 'Не найдено' });
    res.json(item);
  });

  router.post('/', optionalAuth, (req, res) => {
    const { id, createdAt, ...body } = req.body || {};
    const item = col().insert({ status: 'new', ...body, userId: req.user?.id ?? null });
    emit(`${name}:created`, item);
    res.status(201).json(item);
  });

  router.patch('/:id', requireAuth, (req, res) => {
    const { id, createdAt, ...patch } = req.body || {};
    const item = col().update(req.params.id, patch);
    if (!item) return res.status(404).json({ error: 'Не найдено' });
    emit(`${name}:updated`, item);
    res.json(item);
  });

  router.delete('/:id', requireAuth, (req, res) => {
    if (!col().remove(req.params.id)) return res.status(404).json({ error: 'Не найдено' });
    emit(`${name}:deleted`, { id: req.params.id });
    res.json({ ok: true });
  });

  return router;
}
