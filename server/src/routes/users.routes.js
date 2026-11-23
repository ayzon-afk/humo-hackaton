import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userCreateSchema, userUpdateSchema } from '../validation/schemas.js';
import { listUsers, register, updateUser } from '../services/auth.service.js';

/** Управление командой. Смотреть могут все, менять — только админ. */
export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/', async (_req, res) => res.json(await listUsers()));

usersRouter.post('/', requireRole('admin'), validate(userCreateSchema), async (req, res) =>
  res.status(201).json((await register(req.body)).user),
);

usersRouter.patch('/:id', requireRole('admin'), validate(userUpdateSchema), async (req, res) =>
  res.json(await updateUser(req.params.id, req.body)),
);
