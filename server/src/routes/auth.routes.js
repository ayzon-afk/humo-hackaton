import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/security.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';
import { register, login, getUser } from '../services/auth.service.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), async (req, res) =>
  res.status(201).json(await register(req.body)),
);

authRouter.post('/login', authLimiter, validate(loginSchema), async (req, res) => res.json(await login(req.body)));

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await getUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ user });
});
