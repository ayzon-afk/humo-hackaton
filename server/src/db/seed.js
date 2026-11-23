import bcrypt from 'bcryptjs';
import { collection } from './store.js';
import { config } from '../config.js';

const CENTER = [41.3111, 69.2797]; // Ташкент
const CATEGORIES = ['transport', 'ecology', 'education', 'health', 'city'];
const STATUSES = ['new', 'in_progress', 'done'];

function demoItems(n = 24) {
  return Array.from({ length: n }, (_, i) => {
    const daysAgo = Math.floor(Math.random() * 14);
    return {
      title: `Демо-запись #${i + 1}`,
      description: 'Замени seed-данные на реальные данные по теме хакатона',
      category: CATEGORIES[i % CATEGORIES.length],
      status: STATUSES[i % STATUSES.length],
      priority: (i % 5) + 1,
      lat: CENTER[0] + (Math.random() - 0.5) * 0.12,
      lng: CENTER[1] + (Math.random() - 0.5) * 0.16,
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      history: [{ type: 'created', by: 'Демо', at: new Date(Date.now() - daysAgo * 86400000).toISOString() }],
    };
  });
}

const DEMO_USERS = [
  { name: 'Admin', email: 'admin@demo.uz', role: 'admin', password: 'admin123' },
  { name: 'Малика Рахимова', email: 'malika@demo.uz', role: 'manager', password: 'demo123' },
  { name: 'Тимур Алиев', email: 'timur@demo.uz', role: 'user', password: 'demo123' },
];

/** Создаёт демо-пользователей и демо-данные, если их ещё нет. reset — пересоздать всё. */
export function ensureSeed({ reset = false } = {}) {
  const users = collection('users');
  if (reset) users.clear();
  for (const { password, ...user } of DEMO_USERS) {
    if (!users.findOne((u) => u.email === user.email)) {
      users.insert({ ...user, passwordHash: bcrypt.hashSync(password, 10) });
    }
  }

  for (const name of config.collections) {
    const col = collection(name);
    if (reset) col.clear();
    if (col.count() === 0) demoItems().forEach((item) => col.insert(item));
  }
}

if (process.argv.includes('--reset')) {
  ensureSeed({ reset: true });
  setTimeout(() => console.log('✅ База пересоздана. Логин: admin@demo.uz / admin123'), 200);
}
