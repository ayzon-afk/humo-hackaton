import { describe, expect, it } from 'vitest';
import { api } from './helpers.js';

describe('auth', () => {
  it('логинит демо-админа и не отдаёт хеш пароля', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'ADMIN@demo.uz ', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('отклоняет неверный пароль', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'admin@demo.uz', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('валидирует email при регистрации', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.field).toBe('email');
  });

  it('/me требует токен', async () => {
    expect((await api().get('/api/auth/me')).status).toBe(401);
  });
});
