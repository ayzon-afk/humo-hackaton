import { Router } from 'express';
import { config } from '../config.js';
import { aiEnabled } from '../services/ai.service.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { aiRouter } from './ai.routes.js';
import { uploadRouter } from './upload.routes.js';
import { statsRouter } from './stats.routes.js';
import { createCrudRouter } from './crud.routes.js';

export function apiRouter() {
  const router = Router();

  router.get('/health', (_req, res) =>
    res.json({ ok: true, ai: aiEnabled(), collections: config.collections, time: new Date().toISOString() }),
  );

  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/ai', aiRouter);
  router.use('/upload', uploadRouter);
  router.use('/stats', statsRouter);

  for (const name of config.collections) {
    router.use(`/${name}`, createCrudRouter(name));
  }

  return router;
}
