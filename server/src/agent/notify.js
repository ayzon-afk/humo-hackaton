import { config } from '../config.js';

const LEVEL_ICON = { critical: '🔴', warning: '🟠', info: '🔵' };

/** Отправка в Telegram, если заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID. Ошибки не роняют агента. */
export async function sendTelegram(text) {
  const { token, chatId } = config.agent.telegram;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    return res.ok;
  } catch (err) {
    console.error('📨 Telegram error:', err.message);
    return false;
  }
}

export function notifyReport(report) {
  const lines = [
    `<b>📊 Ежедневный отчёт</b>`,
    `<b>${report.ai.headline}</b>`,
    '',
    report.ai.summary,
    '',
    ...report.ai.recommendations.map((r, i) => `${i + 1}. ${r}`),
  ];
  if (report.alerts.length) {
    lines.push('', ...report.alerts.map((a) => `${LEVEL_ICON[a.level]} ${a.title}: ${a.detail}`));
  }
  return sendTelegram(lines.join('\n'));
}

export function notifyAlert(alert) {
  return sendTelegram(`${LEVEL_ICON[alert.level]} <b>${alert.title}</b>\n${alert.detail}`);
}
