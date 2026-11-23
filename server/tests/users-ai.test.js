import { describe, expect, it } from 'vitest';
import { adminAuth, api } from './helpers.js';

describe('users', () => {
  it('админ видит команду без хешей паролей', async () => {
    const res = await api()
      .get('/api/users')
      .set(await adminAuth());
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body.some((u) => 'passwordHash' in u)).toBe(false);
  });

  it('не даёт понизить последнего админа', async () => {
    const headers = await adminAuth();
    const { body: users } = await api().get('/api/users').set(headers);
    const admin = users.find((u) => u.role === 'admin');
    const res = await api().patch(`/api/users/${admin.id}`).set(headers).send({ role: 'user' });
    expect(res.status).toBe(400);
  });
});

describe('ai (без ключа — демо-режим)', () => {
  it('чат отвечает демо-ответом, а не падает', async () => {
    const res = await api()
      .post('/api/ai/chat')
      .send({ messages: [{ role: 'user', content: 'привет' }] });
    expect(res.status).toBe(200);
    expect(res.body.demo).toBe(true);
  });

  it('анализ требует текст', async () => {
    expect((await api().post('/api/ai/analyze').send({})).status).toBe(400);
  });
});

describe('health', () => {
  it('сообщает статус и безопасные заголовки', async () => {
    const res = await api().get('/api/health');
    expect(res.body.ok).toBe(true);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
