import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/security.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';
import { register, login, getUser } from '../services/auth.service.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), (req, res) =>
  res.status(201).json(register(req.body)),
);

authRouter.post('/login', authLimiter, validate(loginSchema), (req, res) => res.json(login(req.body)));

authRouter.get('/me', requireAuth, (req, res) => {
  const user = getUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ user });
});
