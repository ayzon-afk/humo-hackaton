/** Голосовой брифинг: коротко и по делу, что происходит в бизнесе и что решить сегодня. */
import { config } from '../config.js';
import { chat } from '../services/ai.service.js';
import { businessContext } from './context.js';

/** Брифинг по правилам — работает всегда, даже без AI-ключа */
export function briefingFromRules(context) {
  const low = context.stock.filter((i) => i.low);
  const parts = [`На счёте ${context.balance}.`];
  parts.push(low.length ? `Заканчивается: ${low.map((i) => i.name).join(', ')}.` : 'Склад в порядке.');
  if (context.records.urgentOpen) parts.push(`Срочных задач в работе: ${context.records.urgentOpen}.`);
  if (context.alerts[0]) parts.push(`Главное: ${context.alerts[0]}.`);
  if (context.waitingForOwner.length) parts.push(`Ждут вашего решения: ${context.waitingForOwner.length}.`);
  return parts.join(' ');
}

const INSTRUCTION = `Ты — ${config.operator.name}. Владелец слушает тебя голосом, как по телефону.
Перескажи состояние бизнеса в 3–4 коротких предложениях: главное, что горит, что решить сегодня.
Без списков, markdown и эмодзи. Опирайся только на данные.`;

export async function buildBriefing() {
  const context = await businessContext();
  const fallback = briefingFromRules(context);
  const { reply, demo } = await chat({
    system: INSTRUCTION,
    messages: [{ role: 'user', content: JSON.stringify(context) }],
  });
  return demo || !reply ? { text: fallback, source: 'rules' } : { text: reply.trim(), source: 'ai' };
}
