import fs from 'node:fs';
import path from 'node:path';

/**
 * Хранилище в JSON-файле: всё в памяти, на диск пишется с задержкой 100 мс.
 * Для тестов и для демо без PostgreSQL. Интерфейс тот же, что у postgresDriver.
 */
export function createFileDriver(dataFile) {
  let db = {};
  let timer = null;

  try {
    db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    db = {};
  }

  const flush = () => {
    clearTimeout(timer);
    timer = null;
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
  };
  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(flush, 100);
  };

  const list = (name) => (db[name] ??= []);
  const matches = (doc, where) => Object.entries(where).every(([key, value]) => String(doc[key]) === String(value));
  const copy = (doc) => (doc ? structuredClone(doc) : null);

  function query(name, { where = {}, search, searchFields = [], sort = '-createdAt', limit } = {}) {
    let result = list(name).filter((doc) => matches(doc, where));
    if (search) {
      const needle = String(search).toLowerCase();
      result = result.filter((doc) =>
        searchFields.some((f) =>
          String(doc[f] ?? '')
            .toLowerCase()
            .includes(needle),
        ),
      );
    }
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    result.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (desc ? -1 : 1));
    return (limit ? result.slice(0, Number(limit)) : result).map(copy);
  }

  return {
    kind: 'file',
    async query(name, options) {
      return query(name, options);
    },
    async byId(name, id) {
      return copy(list(name).find((doc) => doc.id === id));
    },
    async count(name, where = {}) {
      return list(name).filter((doc) => matches(doc, where)).length;
    },
    async insert(name, doc) {
      list(name).push(structuredClone(doc));
      persist();
      return copy(doc);
    },
    async update(name, id, patch, expected) {
      const doc = list(name).find((d) => d.id === id);
      // expected — условие атомарного обновления: { status: 'pending' } и т.п. (строгое сравнение)
      if (!doc || (expected && !Object.entries(expected).every(([k, v]) => doc[k] === v))) return null;
      Object.assign(doc, structuredClone(patch));
      persist();
      return copy(doc);
    },
    async remove(name, id) {
      const items = list(name);
      const index = items.findIndex((doc) => doc.id === id);
      if (index === -1) return false;
      items.splice(index, 1);
      persist();
      return true;
    },
    async clear(name) {
      db[name] = [];
      persist();
    },
    async close() {
      if (timer) flush();
    },
  };
}
