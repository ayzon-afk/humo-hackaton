import { Router } from 'express';
import { collection } from '../db/store.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { emit } from '../realtime/socket.js';
import { validate } from '../middleware/validate.js';
import { itemCreateSchema, itemUpdateSchema } from '../validation/schemas.js';

const SEARCH_FIELDS = ['title', 'description', 'category'];

/** Запись в журнал изменений: кто, когда и что поменял */
const historyEntry = (type, by, details = {}) => ({ type, by, at: new Date().toISOString(), ...details });

/** ?status=new&q=яма&sort=-createdAt&limit=10 → фильтр, поиск, сортировка и лимит выполняет база */
function toQuery({ q, sort = '-createdAt', limit, ...where }) {
  return { where, search: q, searchFields: SEARCH_FIELDS, sort: String(sort), limit: limit && Number(limit) };
}

/** Универсальный CRUD для любой коллекции + realtime-события `${name}:created|updated|deleted` */
export function createCrudRouter(name) {
  const router = Router();
  const col = () => collection(name);

  router.get('/', async (req, res) => res.json(await col().query(toQuery(req.query))));

  router.get('/:id', async (req, res) => {
    const item = await col().byId(req.params.id);
    if (!item) return res.status(404).json({ error: 'Не найдено' });
    res.json(item);
  });

  router.post('/', optionalAuth, validate(itemCreateSchema), async (req, res) => {
    const { id, createdAt, history, ...body } = req.body;
    const author = req.user?.name ?? 'Гость';
    const item = await col().insert({
      status: 'new',
      ...body,
      userId: req.user?.id ?? null,
      history: [historyEntry('created', author)],
    });
    emit(`${name}:created`, item);
    res.status(201).json(item);
  });

  router.patch('/:id', requireAuth, validate(itemUpdateSchema), async (req, res) => {
    const { id, createdAt, history, ...patch } = req.body;
    const current = await col().byId(req.params.id);
    if (!current) return res.status(404).json({ error: 'Не найдено' });

    const changes = Object.keys(patch)
      .filter((field) => current[field] !== patch[field])
      .map((field) => historyEntry('changed', req.user.name, { field, from: current[field], to: patch[field] }));
    // обновляем, только если запись не поменяли параллельно — иначе потеряли бы чужую историю
    const item = await col().update(
      req.params.id,
      { ...patch, history: [...(current.history ?? []), ...changes] },
      current.updatedAt ? { updatedAt: current.updatedAt } : undefined,
    );
    if (!item) return res.status(409).json({ error: 'Запись только что изменили — обновите страницу' });
    emit(`${name}:updated`, item);
    res.json(item);
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    if (!(await col().remove(req.params.id))) return res.status(404).json({ error: 'Не найдено' });
    emit(`${name}:deleted`, { id: req.params.id });
    res.json({ ok: true });
  });

  return router;
}
