import { describe, expect, it } from 'vitest';
import { computeMetrics } from '../src/agent/metrics.js';
import { detectAlerts } from '../src/agent/rules.js';
import { msUntil } from '../src/agent/scheduler.js';
import { adminAuth, api } from './helpers.js';

const HOUR = 3_600_000;
const NOW = Date.parse('2026-11-24T10:00:00Z');
const iso = (hoursAgo) => new Date(NOW - hoursAgo * HOUR).toISOString();

const item = (overrides) => ({
  id: Math.random().toString(36),
  status: 'new',
  priority: 2,
  category: 'city',
  ...overrides,
});

describe('agent: метрики', () => {
  it('считает новые за сутки, рост и среднее время решения', () => {
    const items = [
      item({ createdAt: iso(2) }),
      item({ createdAt: iso(5) }),
      item({ createdAt: iso(30) }),
      item({
        createdAt: iso(10),
        status: 'done',
        history: [{ field: 'status', to: 'done', at: iso(6) }],
      }),
    ];
    const m = computeMetrics(items, { now: NOW });
    expect(m.created24h).toBe(3);
    expect(m.createdPrev24h).toBe(1);
    expect(m.createdChange).toBe(200);
    expect(m.resolved24h).toBe(1);
    expect(m.avgResolveHours).toBe(4);
    expect(m.resolutionRate).toBe(25);
  });

  it('находит записи без движения', () => {
    const m = computeMetrics([item({ createdAt: iso(72) }), item({ createdAt: iso(1) })], { now: NOW, staleHours: 48 });
    expect(m.staleIds).toHaveLength(1);
  });
});

describe('agent: правила', () => {
  it('поднимает critical при большом числе срочных и сортирует по важности', () => {
    const items = Array.from({ length: 4 }, () => item({ createdAt: iso(1), priority: 5 }));
    const alerts = detectAlerts(computeMetrics(items, { now: NOW }));
    expect(alerts[0]).toMatchObject({ key: 'high-priority', level: 'critical' });
  });

  it('молчит, когда всё спокойно', () => {
    expect(detectAlerts(computeMetrics([item({ createdAt: iso(1) })], { now: NOW }))).toEqual([]);
  });
});

describe('agent: расписание', () => {
  it('считает время до следующего отчёта в часовом поясе', () => {
    const at0830 = new Date('2026-11-24T03:30:00Z'); // 08:30 в Ташкенте
    expect(msUntil('09:00', 'Asia/Tashkent', at0830)).toBe(30 * 60_000);
  });
});

describe('agent: API', () => {
  it('отдаёт статус и формирует отчёт без AI-ключа', async () => {
    const headers = await adminAuth();
    const status = await api().get('/api/agent/status').set(headers);
    expect(status.body.metrics.total).toBeGreaterThan(0);

    const run = await api().post('/api/agent/run').set(headers);
    expect(run.status).toBe(201);
    expect(run.body.source).toBe('rules');
    expect(run.body.ai.recommendations).toHaveLength(3);

    const list = await api().get('/api/agent/reports').set(headers);
    expect(list.body[0].id).toBe(run.body.id);
  });

  it('закрыт без авторизации', async () => {
    expect((await api().get('/api/agent/status')).status).toBe(401);
  });
});
