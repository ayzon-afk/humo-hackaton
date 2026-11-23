/**
 * Правила, по которым агент поднимает тревогу. Каждое правило — отдельная функция:
 * добавить новое = дописать функцию в RULES. level: critical | warning | info.
 */

const RULES = [
  function spike(m) {
    if (m.createdChange != null && m.createdChange >= 50 && m.created24h >= 5) {
      return {
        key: 'spike',
        level: 'warning',
        title: 'Резкий рост новых записей',
        detail: `За сутки ${m.created24h} новых — на ${m.createdChange}% больше, чем днём ранее`,
      };
    }
  },
  function highPriority(m) {
    if (m.highPriorityOpen >= 3) {
      return {
        key: 'high-priority',
        level: 'critical',
        title: 'Много срочных нерешённых',
        detail: `${m.highPriorityOpen} записей с приоритетом 4–5 ждут решения`,
      };
    }
  },
  function stale(m) {
    if (m.staleIds.length > 0) {
      return {
        key: 'stale',
        level: m.staleIds.length >= 5 ? 'critical' : 'warning',
        title: 'Записи без движения',
        detail: `${m.staleIds.length} записей не обновлялись дольше нормы`,
        itemIds: m.staleIds.slice(0, 20),
      };
    }
  },
  function lowResolution(m) {
    if (m.total >= 10 && m.resolutionRate < 40) {
      return {
        key: 'low-resolution',
        level: 'warning',
        title: 'Низкая доля решённых',
        detail: `Решено только ${m.resolutionRate}% от всех записей`,
      };
    }
  },
  function hotCategory(m) {
    const [top] = Object.entries(m.byCategory).sort((a, b) => b[1] - a[1]);
    if (top && m.open >= 6 && top[1] / m.open >= 0.4) {
      return {
        key: `hot-${top[0]}`,
        level: 'info',
        title: 'Проблемная категория',
        detail: `«${top[0]}» — ${top[1]} из ${m.open} открытых записей`,
        category: top[0],
      };
    }
  },
];

const ORDER = { critical: 0, warning: 1, info: 2 };

/** @returns {{key:string, level:string, title:string, detail:string}[]} */
export function detectAlerts(metrics) {
  return RULES.map((rule) => rule(metrics))
    .filter(Boolean)
    .sort((a, b) => ORDER[a.level] - ORDER[b.level]);
}
