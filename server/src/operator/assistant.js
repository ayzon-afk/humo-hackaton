/**
 * Голосовые и текстовые команды владельца.
 * С AI-ключом модель сама выбирает действие (tools), без ключа — простые правила.
 * AI никогда не выполняет рискованное действие сам: только предлагает, человек подтверждает.
 */
import { config } from '../config.js';
import { aiEnabled, chatWithTools } from '../services/ai.service.js';
import { toolDefinitions } from './actions.js';
import { propose } from './proposals.js';
import { findProduct, reorderQuantity } from './inventory.js';
import { businessContext } from './context.js';
import { briefingFromRules } from './briefing.js';

const INSTRUCTION = `Ты — ${config.operator.name}, AI-управляющий бизнесом. Владелец говорит с тобой голосом.
Отвечай по-русски, коротко (1–2 предложения), как живой помощник по телефону. Без markdown и эмодзи.
Если просят что-то сделать — вызови подходящую функцию, владелец подтвердит её голосом.
Если спрашивают — отвечай по данным. Ничего не выдумывай.`;

/** Итог для клиента: текст ответа + предложения, которые ждут «да» */
const answer = (reply, proposals = [], source = 'rules') => ({ reply, proposals, source });

async function withAi(text) {
  const { content, toolCalls } = await chatWithTools({
    messages: [
      { role: 'system', content: `${INSTRUCTION}\nДанные бизнеса: ${JSON.stringify(await businessContext())}` },
      { role: 'user', content: text },
    ],
    tools: toolDefinitions(),
  });
  const proposals = [];
  const notes = [];
  for (const call of toolCalls) {
    try {
      const proposal = await propose({ action: call.name, params: call.args, source: 'command' });
      if (proposal.status === 'pending') proposals.push(proposal);
      else notes.push(proposal.result); // безопасное действие уже выполнено
    } catch (err) {
      notes.push(err.message);
    }
  }
  const reply = [content.trim(), ...notes].filter(Boolean).join(' ');
  return answer(reply || (proposals.length ? 'Подготовил, подтвердите.' : 'Не расслышал, повторите.'), proposals, 'ai');
}

const ORDER = /(?:закаж|заказ|купи|докуп)[а-яё]*\s+(?:ещ[её]\s+)?(.+)/i;
const QUANTITY = /^(\d+)\s*(?:[а-яё]+\.?\s+)?(.+)$/i;
const TASK = /(?:создай|добавь|запиши|поставь)[а-яё]*\s+(?:задач|запис|заявк)[а-яё]*[\s:,-]+(.+)/i;
const REPORT = /отч[её]т/i;
const BRIEFING = /важн|дела|сводк|брифинг|нового|ситуаци|горит/i;
const clean = (text) => text.replace(/[.!?]+$/, '').trim();

async function withRules(text) {
  const order = text.match(ORDER);
  if (order) {
    const [, quantity, product] = clean(order[1]).match(QUANTITY) ?? [null, null, clean(order[1])];
    const item = await findProduct(product);
    const proposal = await propose({
      action: 'place_order',
      params: { product, quantity: Number(quantity) || (item ? reorderQuantity(item) : 1) },
    });
    return answer(`${proposal.summary}. Подтверждаете?`, [proposal]);
  }
  const task = text.match(TASK);
  if (task) {
    const proposal = await propose({ action: 'create_task', params: { title: clean(task[1]) } });
    return answer(`${proposal.summary}. Подтверждаете?`, [proposal]);
  }
  if (REPORT.test(text)) {
    const report = await propose({ action: 'run_report' });
    return answer(report.result);
  }
  const briefing = briefingFromRules(await businessContext());
  if (BRIEFING.test(text)) return answer(briefing);
  return answer(`Могу заказать товар, создать задачу или сделать отчёт. ${briefing}`);
}

export async function handleCommand(text) {
  if (aiEnabled()) {
    try {
      return await withAi(text);
    } catch (err) {
      console.error('🤖 Управляющий: AI недоступен, отвечаю по правилам —', err.message);
    }
  }
  try {
    return await withRules(text);
  } catch (err) {
    return answer(err.message);
  }
}
