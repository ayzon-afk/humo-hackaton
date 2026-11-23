/**
 * Метрики бизнеса из записей коллекции. Чистые функции — легко тестировать
 * и легко адаптировать под тему (поменять поля и формулы здесь).
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const within = (iso, from, to) => {
  const t = new Date(iso).getTime();
  return t >= from && t < to;
};

/** Когда запись перешла в статус «решено» (из журнала history) */
export function resolvedAt(item, doneStatus) {
  const entry = [...(item.history ?? [])].reverse().find((h) => h.field === 'status' && h.to === doneStatus);
  return entry ? new Date(entry.at).getTime() : null;
}

const countBy = (items, field) =>
  items.reduce((acc, item) => ({ ...acc, [item[field] ?? 'unknown']: (acc[item[field] ?? 'unknown'] || 0) + 1 }), {});

/**
 * @param {object[]} items записи коллекции
 * @param {{ now?: number, doneStatus?: string, staleHours?: number }} options
 */
export function computeMetrics(items, { now = Date.now(), doneStatus = 'done', staleHours = 48 } = {}) {
  const open = items.filter((i) => i.status !== doneStatus);
  const done = items.filter((i) => i.status === doneStatus);

  const created24h = items.filter((i) => within(i.createdAt, now - DAY, now)).length;
  const createdPrev24h = items.filter((i) => within(i.createdAt, now - 2 * DAY, now - DAY)).length;
  const resolved24h = items.filter((i) => {
    const at = resolvedAt(i, doneStatus);
    return at && at >= now - DAY;
  }).length;

  const resolveHours = done
    .map((i) => (resolvedAt(i, doneStatus) - new Date(i.createdAt).getTime()) / HOUR)
    .filter((h) => Number.isFinite(h) && h >= 0);

  const stale = open.filter((i) => {
    const lastTouch = new Date(i.updatedAt || i.createdAt).getTime();
    return now - lastTouch > staleHours * HOUR;
  });

  return {
    total: items.length,
    open: open.length,
    done: done.length,
    resolutionRate: items.length ? Math.round((done.length / items.length) * 100) : 0,
    created24h,
    createdPrev24h,
    createdChange: createdPrev24h ? Math.round(((created24h - createdPrev24h) / createdPrev24h) * 100) : null,
    resolved24h,
    avgResolveHours: resolveHours.length
      ? Math.round((resolveHours.reduce((a, b) => a + b, 0) / resolveHours.length) * 10) / 10
      : null,
    highPriorityOpen: open.filter((i) => (i.priority ?? 0) >= 4).length,
    staleIds: stale.map((i) => i.id),
    byStatus: countBy(items, 'status'),
    byCategory: countBy(open, 'category'),
  };
}
