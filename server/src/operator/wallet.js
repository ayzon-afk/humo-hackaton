/** Демо-счёт бизнеса: AI тратит деньги только отсюда и только после подтверждения человека. */
import { collection } from '../db/store.js';
import { config } from '../config.js';
import { httpError } from '../utils/httpError.js';

const wallets = () => collection('wallet');

export const money = (amount) =>
  `${Math.round(amount).toLocaleString('ru-RU').replace(/\s/g, ' ')} ${config.operator.currency}`;

function account() {
  return wallets().findOne(() => true) ?? wallets().insert({ balance: config.operator.startBalance });
}

export const getBalance = () => account().balance;

/** Списать сумму. Не хватает денег — понятная ошибка, баланс не трогаем. */
export function charge(amount, reason) {
  const current = account();
  if (amount > current.balance) {
    throw httpError(400, `Не хватает денег: нужно ${money(amount)}, на счёте ${money(current.balance)}`);
  }
  return wallets().update(current.id, { balance: current.balance - amount, lastCharge: { amount, reason } }).balance;
}

export function resetWallet() {
  wallets().clear();
  return account();
}
