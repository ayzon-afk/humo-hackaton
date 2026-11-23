import { describe, expect, it } from 'vitest';
import { adminAuth, api } from './helpers.js';

describe('CRUD /api/items', () => {
  it('отдаёт список с фильтром и лимитом', async () => {
    const res = await api().get('/api/items?status=new&limit=3');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(3);
    expect(res.body.every((x) => x.status === 'new')).toBe(true);
  });

  it('не создаёт запись без названия', async () => {
    const res = await api().post('/api/items').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.field).toBe('title');
  });

  it('создаёт запись со статусом new и историей', async () => {
    const res = await api().post('/api/items').send({ title: 'Яма на дороге', priority: '4' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Яма на дороге', status: 'new', priority: 4 });
    expect(res.body.history[0].type).toBe('created');
  });

  it('изменение требует авторизации и пишет историю', async () => {
    const { body: item } = await api().post('/api/items').send({ title: 'Фонарь не горит' });
    expect((await api().patch(`/api/items/${item.id}`).send({ status: 'done' })).status).toBe(401);

    const res = await api()
      .patch(`/api/items/${item.id}`)
      .set(await adminAuth())
      .send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.history.at(-1)).toMatchObject({ type: 'changed', field: 'status', from: 'new', to: 'done' });
  });

  it('считает статистику', async () => {
    const res = await api().get('/api/stats/items');
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.timeline).toHaveLength(14);
  });
});
