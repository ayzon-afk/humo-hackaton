/**
 * Склад: остатки, поиск товара по названию (голосом говорят неточно), пополнение и списание.
 * Под тему склад может стать чем угодно расходным: материалы, лекарства, запчасти, корм.
 */
import { collection } from '../db/store.js';
import { emit } from '../realtime/socket.js';
import { httpError } from '../utils/httpError.js';

export const stock = () => collection('inventory');

export const isLow = (item) => item.quantity <= item.minQuantity;

/** Сколько заказать, чтобы запаса хватило надолго: до трёх минимумов */
export const reorderQuantity = (item) => Math.max(item.minQuantity, item.minQuantity * 3 - item.quantity);

// ё→е, й→и: «яиц» должно находить «Яйца»
const normalize = (text) => String(text).toLowerCase().replace(/ё/g, 'е').replace(/й/g, 'и').trim();
// «молока» → «мол»: отрезаем окончание, чтобы падежи находили товар
const stem = (word) => word.slice(0, Math.max(3, word.length - 2));

/** «молоко», «молока», «Молоко 1 л» — всё найдёт «Молоко 1 л» */
export function findProduct(name) {
  const needle = normalize(name);
  if (!needle) return null;
  const items = stock().all();
  const words = (item) => normalize(item.name).split(/\s+/);
  return (
    items.find((i) => normalize(i.name) === needle) ??
    items.find((i) => normalize(i.name).includes(needle)) ??
    items.find((i) => needle.split(/\s+/).some((w) => words(i).some((iw) => iw.startsWith(stem(w))))) ??
    null
  );
}

export function changeQuantity(id, delta) {
  const item = stock().byId(id);
  if (!item) throw httpError(404, 'Товар не найден на складе');
  const updated = stock().update(id, { quantity: Math.max(0, item.quantity + delta) });
  emit('inventory:updated', updated);
  return updated;
}

/** Демо «продажа»: товар уходит ниже минимума — агент это заметит и позвонит */
export function simulateSale(productId) {
  const items = stock().all();
  const target = productId
    ? items.find((i) => i.id === productId)
    : items.filter((i) => !isLow(i)).sort((a, b) => a.quantity / a.minQuantity - b.quantity / b.minQuantity)[0];
  if (!target) throw httpError(404, 'Нет товара для демо-продажи');
  const left = Math.floor(target.minQuantity * 0.4);
  return changeQuantity(target.id, left - target.quantity);
}

/** Тревога для отчёта агента, когда что-то заканчивается */
export function stockAlert() {
  const low = stock().all().filter(isLow);
  if (!low.length) return null;
  return {
    key: 'low-stock',
    level: low.length >= 3 ? 'critical' : 'warning',
    title: 'Товар заканчивается',
    detail: low.map((i) => `${i.name}: ${i.quantity} ${i.unit}`).join(', '),
  };
}
