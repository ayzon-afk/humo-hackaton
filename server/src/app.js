import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { apiRouter } from './routes/index.js';
import { apiNotFound, errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/security.js';

/** Собирает Express-приложение без запуска сервера (удобно для тестов). */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  fs.mkdirSync(config.paths.uploadsDir, { recursive: true });
  app.use('/uploads', express.static(config.paths.uploadsDir));

  app.use('/api', apiRouter());
  app.use('/api', apiNotFound);

  // Прод: отдаём собранный фронт (один сервис на Render)
  const indexHtml = path.join(config.paths.clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(config.paths.clientDist));
    app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(indexHtml) : next()));
  }

  app.use(errorHandler);
  return app;
}
