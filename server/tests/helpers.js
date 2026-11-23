import { afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closeStore, initStore } from '../src/db/store.js';
import { ensureSeed } from '../src/db/seed.js';

await initStore();
await ensureSeed();
afterAll(() => closeStore({ dropSchema: true }));

export const app = createApp();
export const api = () => request(app);

/** Логин демо-админом, возвращает заголовок Authorization */
export async function adminAuth() {
  const res = await api().post('/api/auth/login').send({ email: 'admin@demo.uz', password: 'admin123' });
  return { Authorization: `Bearer ${res.body.token}` };
}
