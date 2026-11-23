import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(serverRoot, '.env'), quiet: true });

const env = process.env;

/** Единая конфигурация приложения. Все значения — из переменных окружения с безопасными дефолтами. */
export const config = {
  env: env.NODE_ENV || 'development',
  port: Number(env.PORT) || 5000,
  jwtSecret: env.JWT_SECRET || 'dev-secret-change-me',
  collections: (env.COLLECTIONS || 'items')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  ai: {
    baseUrl: (env.AI_BASE_URL || '').replace(/\/$/, ''),
    apiKey: env.AI_API_KEY || '',
    model: env.AI_MODEL || '',
    visionModel: env.AI_VISION_MODEL || env.AI_MODEL || '',
    timeoutMs: Number(env.AI_TIMEOUT_MS) || 20000,
  },
  agent: {
    enabled: env.AGENT_ENABLED !== 'false',
    reportTime: env.AGENT_REPORT_TIME || '09:00', // ежедневный отчёт, локальное время
    timezone: env.AGENT_TZ || 'Asia/Tashkent',
    checkMinutes: Number(env.AGENT_CHECK_MINUTES) || 15, // как часто проверять алерты
    staleHours: Number(env.AGENT_STALE_HOURS) || 48, // «зависшая» запись без движения
    doneStatus: env.AGENT_DONE_STATUS || 'done',
    collection: env.AGENT_COLLECTION || (env.COLLECTIONS || 'items').split(',')[0].trim(),
    telegram: { token: env.TELEGRAM_BOT_TOKEN || '', chatId: env.TELEGRAM_CHAT_ID || '' },
  },
  operator: {
    name: env.OPERATOR_NAME || 'AI-управляющий',
    startBalance: Number(env.OPERATOR_BALANCE) || 20_000_000, // демо-счёт бизнеса
    maxAmount: Number(env.OPERATOR_MAX_AMOUNT) || 5_000_000, // лимит одного действия AI
    currency: env.OPERATOR_CURRENCY || 'сум',
  },
  db: {
    url: env.DATABASE_URL || '', // пусто → данные в JSON-файле (paths.dataFile)
    schema: env.DATABASE_SCHEMA || '',
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  paths: {
    dataFile: env.DATA_FILE || path.join(serverRoot, 'data', 'db.json'),
    uploadsDir: path.join(serverRoot, 'uploads'),
    clientDist: path.resolve(serverRoot, '..', 'client', 'dist'),
  },
};
