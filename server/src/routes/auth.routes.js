import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { register, login, getUser } from '../services/auth.service.js';

export const authRouter = Router();

authRouter.post('/register', (req, res) => res.status(201).json(register(req.body)));

authRouter.post('/login', (req, res) => res.json(login(req.body)));

authRouter.get('/me', requireAuth, (req, res) => {
  const user = getUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ user });
});
