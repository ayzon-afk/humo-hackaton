import { Router } from 'express';
import { collection } from '../db/store.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { emit } from '../realtime/socket.js';
import { validate } from '../middleware/validate.js';
import { itemCreateSchema, itemUpdateSchema } from '../validation/schemas.js';

const SEARCH_FIELDS = ['title', 'description', 'category'];

/** Запись в журнал изменений: кто, когда и что поменял */
const historyEntry = (type, by, details = {}) => ({ type, by, at: new Date().toISOString(), ...details });

function applyQuery(items, query) {
  const { q, sort = '-createdAt', limit, ...filters } = query;
  let result = items.filter((item) =>
    Object.entries(filters).every(([key, value]) => String(item[key]) === String(value)),
  );
  if (q) {
    const needle = String(q).toLowerCase();
    result = result.filter((item) =>
      SEARCH_FIELDS.some((f) =>
        String(item[f] ?? '')
          .toLowerCase()
          .includes(needle),
      ),
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

  router.post('/', optionalAuth, validate(itemCreateSchema), (req, res) => {
    const { id, createdAt, history, ...body } = req.body;
    const author = req.user?.name ?? 'Гость';
    const item = col().insert({
      status: 'new',
      ...body,
      userId: req.user?.id ?? null,
      history: [historyEntry('created', author)],
    });
    emit(`${name}:created`, item);
    res.status(201).json(item);
  });

  router.patch('/:id', requireAuth, validate(itemUpdateSchema), (req, res) => {
    const { id, createdAt, history, ...patch } = req.body;
    const current = col().byId(req.params.id);
    if (!current) return res.status(404).json({ error: 'Не найдено' });

    const changes = Object.keys(patch)
      .filter((field) => current[field] !== patch[field])
      .map((field) => historyEntry('changed', req.user.name, { field, from: current[field], to: patch[field] }));
    const item = col().update(req.params.id, { ...patch, history: [...(current.history ?? []), ...changes] });
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
