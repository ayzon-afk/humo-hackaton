import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

/** Безопасные HTTP-заголовки. CSP выключен: карта грузит тайлы со стороннего CDN. */
export const securityHeaders = helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false });

const limiter = (max, message) =>
  rateLimit({
    windowMs: 60_000,
    limit: config.env === 'test' ? 10_000 : max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: message },
  });

/** Защита от перебора паролей */
export const authLimiter = limiter(20, 'Слишком много попыток входа. Подождите минуту.');

/** AI-запросы стоят денег — ограничиваем частоту */
export const aiLimiter = limiter(30, 'Слишком много запросов к AI. Подождите минуту.');
