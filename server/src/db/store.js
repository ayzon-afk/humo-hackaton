import crypto from 'node:crypto';
import { config } from '../config.js';
import { createFileDriver } from './drivers/fileDriver.js';
import { createPostgresDriver } from './drivers/postgresDriver.js';

/**
 * Хранилище: PostgreSQL, если задан DATABASE_URL, иначе JSON-файл (тесты, демо без базы).
 * Код приложения работает только с collection(name) и не знает, какая база под ним.
 */
let driver = null;

export async function initStore() {
  if (driver) return driver;
  const { url, schema, ssl } = config.db;
  driver = url ? await createPostgresDriver({ url, schema, ssl }) : createFileDriver(config.paths.dataFile);
  return driver;
}

export const storeKind = () => driver?.kind ?? 'none';

export async function closeStore(options) {
  await driver?.close(options);
  driver = null;
}

const ready = () => {
  if (!driver) throw new Error('Хранилище не инициализировано: вызовите initStore()');
  return driver;
};

/** Коллекция документов. where — равенство полей: { status: 'new' } */
export function collection(name) {
  return {
    all: () => ready().query(name, { sort: 'createdAt' }),
    find: (where = {}) => ready().query(name, { where, sort: 'createdAt' }),
    findOne: async (where = {}) => (await ready().query(name, { where, sort: 'createdAt', limit: 1 }))[0] ?? null,
    /** Фильтр + поиск + сортировка + лимит — выполняются в базе */
    query: (options) => ready().query(name, options),
    byId: (id) => ready().byId(name, id),
    count: (where) => ready().count(name, where),
    insert: (doc) => ready().insert(name, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...doc }),
    /** Обновить поля. expected — обновить, только если документ всё ещё такой (защита от гонок) */
    update: (id, patch, expected) =>
      ready().update(name, id, { ...patch, id, updatedAt: new Date().toISOString() }, expected),
    remove: (id) => ready().remove(name, id),
    clear: () => ready().clear(name),
  };
}
