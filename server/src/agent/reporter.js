import { collection } from '../db/store.js';
import { config } from '../config.js';
import { analyze } from '../services/ai.service.js';
import { computeMetrics } from './metrics.js';
import { detectAlerts } from './rules.js';
import { stockAlert } from '../operator/inventory.js';

const KEEP_REPORTS = 30;

/** Текущее состояние бизнеса: метрики + алерты (без AI, мгновенно) */
export async function snapshot(now = Date.now()) {
  const { collection: name, doneStatus, staleHours } = config.agent;
  const metrics = computeMetrics(await collection(name).all(), { now, doneStatus, staleHours });
  return { metrics, alerts: [await stockAlert(), ...detectAlerts(metrics)].filter(Boolean) };
}

/** Какое действие предложить по каждой тревоге (когда AI недоступен) */
const ACTIONS = {
  'high-priority': 'Назначьте ответственных на срочные записи и закройте их до конца дня',
  stale: 'Разберите записи без движения: обновите статус или закройте',
  spike: 'Выясните причину роста новых записей — возможна массовая проблема',
  'low-resolution': 'Сначала закрывайте старые записи, потом берите новые',
  hot: 'Выделите отдельного ответственного на проблемную категорию',
  'low-stock': 'Подтвердите заказ товаров, которые заканчиваются — AI-управляющий уже подготовил его',
};
const DEFAULT_ACTIONS = [
  'Разберите новые записи до обеда',
  'Проверьте записи в работе дольше суток',
  'Отметьте решённые, чтобы статистика была точной',
];

/** Отчёт без AI — работает всегда, даже без ключа и интернета */
function fallbackNarrative(m, alerts) {
  const trend = m.createdChange == null ? '' : `, ${m.createdChange >= 0 ? '+' : ''}${m.createdChange}% к вчера`;
  const actions = alerts.map((a) => ACTIONS[a.key.startsWith('hot-') ? 'hot' : a.key]).filter(Boolean);
  const recommendations = [...new Set([...actions, ...DEFAULT_ACTIONS])].slice(0, 3);
  return {
    headline: `${m.created24h} новых за сутки, решено ${m.resolutionRate}%`,
    summary: `Всего ${m.total} записей, открыто ${m.open}${trend}. За сутки решено ${m.resolved24h}. Срочных в работе: ${m.highPriorityOpen}.`,
    recommendations,
  };
}

const INSTRUCTION = `Ты — AI-операционный директор. По метрикам и алертам напиши ежедневный отчёт руководителю на русском.
Верни JSON: { "headline": "главный вывод, до 10 слов", "summary": "2-3 предложения: что происходит и почему",
"recommendations": ["3 конкретных действия на сегодня, по одному предложению"] }`;

/** Полный ежедневный отчёт: метрики → алерты → вывод AI. Сохраняется в коллекцию reports. */
export async function buildReport({ reason = 'manual' } = {}) {
  const { metrics, alerts } = await snapshot();
  const fallback = fallbackNarrative(metrics, alerts);

  const { result, demo } = await analyze({
    text: JSON.stringify({ metrics: { ...metrics, staleIds: metrics.staleIds.length }, alerts }),
    instruction: INSTRUCTION,
  });
  const fromAi = !demo && result?.headline && Array.isArray(result.recommendations);
  const ai = fromAi
    ? { headline: result.headline, summary: result.summary, recommendations: result.recommendations.slice(0, 3) }
    : fallback;

  const reports = collection('reports');
  const report = await reports.insert({ reason, metrics, alerts, ai, source: fromAi ? 'ai' : 'rules' });

  // храним только последние KEEP_REPORTS отчётов
  const old = (await reports.query({ sort: '-createdAt' })).slice(KEEP_REPORTS);
  await Promise.all(old.map((r) => reports.remove(r.id)));

  return report;
}

export function listReports(limit = 14) {
  return collection('reports').query({ sort: '-createdAt', limit });
}
