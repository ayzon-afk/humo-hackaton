/**
 * Предложения AI: AI предлагает действие → человек подтверждает → действие выполняется.
 * Деньги и данные AI меняет только так. Каждое предложение остаётся в журнале.
 */
import { collection } from '../db/store.js';
import { config } from '../config.js';
import { emit } from '../realtime/socket.js';
import { httpError } from '../utils/httpError.js';
import { ACTIONS } from './actions.js';
import { money } from './wallet.js';

const proposals = () => collection('proposals');

/** Создать предложение. Параметры проверяются схемой действия, сумма — лимитом. */
export async function propose({ action, params = {}, reason = '', source = 'command', dedupeKey = null }) {
  const definition = ACTIONS[action];
  if (!definition) throw httpError(400, `Неизвестное действие: ${action}`);

  const parsed = definition.schema.safeParse(params);
  if (!parsed.success) throw httpError(400, `Не хватает данных: ${parsed.error.issues[0].message}`);

  const prepared = definition.prepare(parsed.data);
  if (prepared.amount > config.operator.maxAmount) {
    throw httpError(
      400,
      `${money(prepared.amount)} — больше лимита ${money(config.operator.maxAmount)} на одно действие`,
    );
  }

  // агент проверяет склад регулярно — не звоним дважды по одному поводу
  const duplicate = dedupeKey && proposals().findOne((p) => p.status === 'pending' && p.dedupeKey === dedupeKey);
  if (duplicate) return duplicate;

  const proposal = proposals().insert({
    action,
    title: definition.title,
    params: prepared.params,
    amount: prepared.amount,
    summary: prepared.summary,
    reason,
    speech: `${reason ? `${reason}. ` : ''}${prepared.summary}?`,
    source,
    dedupeKey,
    status: 'pending',
  });
  if (definition.autoApprove) return resolve(proposal.id, { approve: true, by: config.operator.name });
  emit('operator:proposal', proposal);
  return proposal;
}

/** Подтвердить или отклонить. Выполняется только pending — двойное «да» ничего не сломает. */
export async function resolve(id, { approve, by }) {
  const proposal = proposals().byId(id);
  if (!proposal) throw httpError(404, 'Предложение не найдено');
  if (proposal.status !== 'pending') throw httpError(409, 'Это решение уже принято');

  let patch = { status: 'rejected', result: 'Отклонено' };
  if (approve) {
    proposals().update(id, { status: 'running' });
    try {
      const result = await ACTIONS[proposal.action].execute(proposal.params, {
        amount: proposal.amount,
        by: config.operator.name,
      });
      patch = { status: 'done', result };
    } catch (err) {
      patch = { status: 'failed', result: err.message };
    }
  }
  const updated = proposals().update(id, { ...patch, resolvedBy: by, resolvedAt: new Date().toISOString() });
  emit('operator:resolved', updated);
  return updated;
}

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

export const pendingProposals = () =>
  proposals()
    .find((p) => p.status === 'pending')
    .sort(newestFirst);

export const proposalHistory = (limit = 20) =>
  proposals()
    .find((p) => !['pending', 'running'].includes(p.status))
    .sort((a, b) => (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? ''))
    .slice(0, limit);
