import bcrypt from 'bcryptjs';
import { collection } from './store.js';
import { config } from '../config.js';
import { DEMO_STOCK } from './demoStock.js';
import { resetWallet } from '../operator/wallet.js';

const CENTER = [41.3111, 69.2797]; // Ташкент
const CATEGORIES = ['transport', 'ecology', 'education', 'health', 'city'];
const STATUSES = ['new', 'in_progress', 'done'];
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Демо-записи с правдоподобной историей: решённые получают событие «статус → done» */
function demoItems(n = 24) {
  return Array.from({ length: n }, (_, i) => {
    const created = Date.now() - Math.floor(Math.random() * 14 * DAY) - HOUR;
    const status = STATUSES[i % STATUSES.length];
    const at = (offsetHours) => new Date(Math.min(Date.now(), created + offsetHours * HOUR)).toISOString();
    const history = [{ type: 'created', by: 'Демо', at: at(0) }];
    if (status !== 'new') {
      history.push({
        type: 'changed',
        by: 'Малика Рахимова',
        field: 'status',
        from: 'new',
        to: 'in_progress',
        at: at(2),
      });
    }
    if (status === 'done') {
      history.push({
        type: 'changed',
        by: 'Тимур Алиев',
        field: 'status',
        from: 'in_progress',
        to: 'done',
        at: at(4 + (i % 7) * 5),
      });
    }
    return {
      title: `Демо-запись #${i + 1}`,
      description: 'Замени seed-данные на реальные данные по теме хакатона',
      category: CATEGORIES[i % CATEGORIES.length],
      status,
      priority: (i % 5) + 1,
      lat: CENTER[0] + (Math.random() - 0.5) * 0.12,
      lng: CENTER[1] + (Math.random() - 0.5) * 0.16,
      createdAt: new Date(created).toISOString(),
      ...(status !== 'new' && { updatedAt: history.at(-1).at }),
      history,
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
    if (reset) collection('reports').clear();
    if (col.count() === 0) demoItems().forEach((item) => col.insert(item));
  }

  // AI-управляющий: склад, счёт, журнал решений
  const stock = collection('inventory');
  if (reset) {
    stock.clear();
    ['proposals', 'orders'].forEach((name) => collection(name).clear());
    resetWallet();
  }
  if (stock.count() === 0) DEMO_STOCK.forEach((item) => stock.insert(item));
}

if (process.argv.includes('--reset')) {
  ensureSeed({ reset: true });
  setTimeout(() => console.log('✅ База пересоздана. Логин: admin@demo.uz / admin123'), 200);
}
