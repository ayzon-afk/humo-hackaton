/** Демо-счёт бизнеса: AI тратит деньги только отсюда и только после подтверждения человека. */
import { collection } from '../db/store.js';
import { config } from '../config.js';
import { httpError } from '../utils/httpError.js';

const wallets = () => collection('wallet');

export const money = (amount) =>
  `${Math.round(amount).toLocaleString('ru-RU').replace(/\s/g, ' ')} ${config.operator.currency}`;

async function account() {
  return (await wallets().findOne()) ?? wallets().insert({ balance: config.operator.startBalance });
}

export const getBalance = async () => (await account()).balance;

/**
 * Списать сумму. Не хватает денег — понятная ошибка, баланс не трогаем.
 * Списание атомарное: два одновременных заказа не уведут счёт в минус.
 */
export async function charge(amount, reason) {
  const current = await account();
  if (amount > current.balance) {
    throw httpError(400, `Не хватает денег: нужно ${money(amount)}, на счёте ${money(current.balance)}`);
  }
  const patch = { balance: current.balance - amount, lastCharge: { amount, reason } };
  const updated = await wallets().update(current.id, patch, { balance: current.balance });
  return updated ? updated.balance : charge(amount, reason); // счёт изменился параллельно — пересчитать
}

export async function resetWallet() {
  await wallets().clear();
  return account();
}
