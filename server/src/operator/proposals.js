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

  const prepared = await definition.prepare(parsed.data);
  if (prepared.amount > config.operator.maxAmount) {
    throw httpError(
      400,
      `${money(prepared.amount)} — больше лимита ${money(config.operator.maxAmount)} на одно действие`,
    );
  }

  // агент проверяет склад регулярно — не звоним дважды по одному поводу
  const duplicate = dedupeKey && (await proposals().findOne({ status: 'pending', dedupeKey }));
  if (duplicate) return duplicate;

  const proposal = await proposals().insert({
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
  const proposal = await proposals().byId(id);
  if (!proposal) throw httpError(404, 'Предложение не найдено');
  // атомарно забираем решение: второе «да» с другого телефона получит 409, а не двойной заказ
  const claimed = await proposals().update(id, { status: approve ? 'running' : 'rejected' }, { status: 'pending' });
  if (!claimed) throw httpError(409, 'Это решение уже принято');

  let patch = { status: 'rejected', result: 'Отклонено' };
  if (approve) {
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
  const updated = await proposals().update(id, { ...patch, resolvedBy: by, resolvedAt: new Date().toISOString() });
  emit('operator:resolved', updated);
  return updated;
}

export const pendingProposals = () => proposals().query({ where: { status: 'pending' }, sort: '-createdAt' });

export const proposalHistory = async (limit = 20) =>
  (await proposals().query({ sort: '-resolvedAt' }))
    .filter((p) => !['pending', 'running'].includes(p.status))
    .slice(0, limit);
