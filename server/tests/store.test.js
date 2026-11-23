import { describe, expect, it } from 'vitest';
import './helpers.js';
import { collection, storeKind } from '../src/db/store.js';

// Один и тот же контракт для JSON-файла и PostgreSQL (с TEST_DATABASE_URL тесты идут в настоящую базу)
describe(`store (${process.env.TEST_DATABASE_URL ? 'postgres' : 'file'})`, () => {
  const col = collection(`contract_${Date.now()}`);

  it('работает на ожидаемом драйвере', () => {
    expect(storeKind()).toBe(process.env.TEST_DATABASE_URL ? 'postgres' : 'file');
  });

  it('вставляет с id и createdAt, читает по id', async () => {
    const doc = await col.insert({ title: 'Яма на Чиланзаре', status: 'new', priority: 5 });
    expect(doc.id).toBeTypeOf('string');
    expect(await col.byId(doc.id)).toMatchObject({ title: 'Яма на Чиланзаре', priority: 5 });
    expect(await col.byId('нет-такого')).toBeNull();
  });

  it('фильтрует, ищет без учёта регистра, сортирует и ограничивает', async () => {
    await col.insert({ title: 'Фонарь не горит', status: 'done', priority: 2 });
    await col.insert({ title: 'Свалка у Чорсу', status: 'new', priority: 3 });

    expect(await col.count({ status: 'new' })).toBe(2);
    const found = await col.query({ search: 'ЧИЛАНЗАР', searchFields: ['title'] });
    expect(found.map((d) => d.title)).toEqual(['Яма на Чиланзаре']);

    const byPriority = await col.query({ sort: '-priority', limit: 2 });
    expect(byPriority.map((d) => d.priority)).toEqual([5, 3]);
    expect(await col.find({ priority: '2' })).toHaveLength(1); // значения из query string — строки
  });

  it('атомарное обновление: второе «да» не проходит', async () => {
    const doc = await col.insert({ status: 'pending' });
    const [first, second] = await Promise.all([
      col.update(doc.id, { status: 'running' }, { status: 'pending' }),
      col.update(doc.id, { status: 'running' }, { status: 'pending' }),
    ]);
    expect([first, second].filter(Boolean)).toHaveLength(1);
    expect((await col.byId(doc.id)).updatedAt).toBeTypeOf('string');
  });

  it('удаляет и очищает', async () => {
    const doc = await col.insert({ title: 'временная' });
    expect(await col.remove(doc.id)).toBe(true);
    expect(await col.remove(doc.id)).toBe(false);
    await col.clear();
    expect(await col.count()).toBe(0);
  });
});
