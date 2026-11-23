import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config.js';

// Простое JSON-хранилище: всё в памяти, на диск пишется с задержкой 100 мс.
let db = null;
let timer = null;

function load() {
  if (db) return db;
  try {
    db = JSON.parse(fs.readFileSync(config.paths.dataFile, 'utf8'));
  } catch {
    db = {};
  }
  return db;
}

function persist() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fs.mkdirSync(path.dirname(config.paths.dataFile), { recursive: true });
    fs.writeFileSync(config.paths.dataFile, JSON.stringify(db, null, 2));
  }, 100);
}

export function collection(name) {
  const data = load();
  if (!data[name]) data[name] = [];
  const list = () => data[name];
  const byId = (id) => list().find((x) => x.id === id);

  return {
    all: () => [...list()],
    find: (fn) => list().filter(fn),
    findOne: (fn) => list().find(fn),
    byId,
    count: () => list().length,
    insert(doc) {
      const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...doc };
      list().push(item);
      persist();
      return item;
    },
    update(id, patch) {
      const item = byId(id);
      if (!item) return null;
      Object.assign(item, patch, { id, updatedAt: new Date().toISOString() });
      persist();
      return item;
    },
    remove(id) {
      const i = list().findIndex((x) => x.id === id);
      if (i === -1) return false;
      list().splice(i, 1);
      persist();
      return true;
    },
    clear() {
      data[name] = [];
      persist();
    },
  };
}
