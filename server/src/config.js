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
  paths: {
    dataFile: env.DATA_FILE || path.join(serverRoot, 'data', 'db.json'),
    uploadsDir: path.join(serverRoot, 'uploads'),
    clientDist: path.resolve(serverRoot, '..', 'client', 'dist'),
  },
};
