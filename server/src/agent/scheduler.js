import { config } from '../config.js';
import { emit } from '../realtime/socket.js';
import { buildReport, listReports, snapshot } from './reporter.js';
import { notifyAlert, notifyReport } from './notify.js';
import { scanInventory } from '../operator/watcher.js';

const state = { nextReportAt: null, lastCheckAt: null, seenAlerts: new Set(), timers: [] };

/** Сколько мс до ближайшего HH:MM в часовом поясе агента */
export function msUntil(time, timezone, now = new Date()) {
  const [hh, mm] = time.split(':').map(Number);
  const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const target = new Date(local);
  target.setHours(hh, mm, 0, 0);
  if (target <= local) target.setDate(target.getDate() + 1);
  return target - local;
}

async function runDailyReport() {
  try {
    const report = await buildReport({ reason: 'schedule' });
    emit('agent:report', report);
    await notifyReport(report);
    console.log(`🤖 Агент: отчёт готов — ${report.ai.headline}`);
  } catch (err) {
    console.error('🤖 Агент: ошибка отчёта', err.message);
  } finally {
    scheduleReport();
  }
}

function scheduleReport() {
  const delay = msUntil(config.agent.reportTime, config.agent.timezone);
  state.nextReportAt = new Date(Date.now() + delay).toISOString();
  state.timers.push(setTimeout(runDailyReport, delay));
}

/** Проверка алертов: новые critical/warning сразу уходят в CRM (WebSocket) и Telegram */
async function checkAlerts() {
  state.lastCheckAt = new Date().toISOString();
  const { alerts } = snapshot();
  for (const alert of alerts) {
    if (alert.level === 'info' || state.seenAlerts.has(alert.key)) continue;
    state.seenAlerts.add(alert.key);
    emit('agent:alert', alert);
    await notifyAlert(alert);
  }
  // алерт, который исчез, снова сможет сработать в будущем
  const active = new Set(alerts.map((a) => a.key));
  [...state.seenAlerts].filter((k) => !active.has(k)).forEach((k) => state.seenAlerts.delete(k));
  // склад: товар заканчивается → AI-управляющий готовит заказ и звонит владельцу
  await scanInventory();
}

export function startAgent() {
  if (!config.agent.enabled || config.env === 'test') return;
  // первый отчёт сразу, чтобы в CRM было что показать
  if (listReports(1).length === 0) buildReport({ reason: 'startup' }).catch(() => {});
  scheduleReport();
  checkAlerts();
  state.timers.push(setInterval(checkAlerts, config.agent.checkMinutes * 60_000));
  console.log(`🤖 Агент: отчёт каждый день в ${config.agent.reportTime} (${config.agent.timezone})`);
}

export function agentStatus() {
  const { enabled, reportTime, timezone, checkMinutes, collection } = config.agent;
  return {
    enabled,
    reportTime,
    timezone,
    checkMinutes,
    collection,
    telegram: Boolean(config.agent.telegram.token && config.agent.telegram.chatId),
    nextReportAt: state.nextReportAt,
    lastCheckAt: state.lastCheckAt,
  };
}
