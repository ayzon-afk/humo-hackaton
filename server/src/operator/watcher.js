/** Следит за складом: товар ниже минимума → AI сам предлагает заказ и «звонит» владельцу. */
import { isLow, reorderQuantity, stock } from './inventory.js';
import { propose } from './proposals.js';

export async function scanInventory() {
  const found = [];
  for (const item of stock().all().filter(isLow)) {
    try {
      found.push(
        await propose({
          action: 'place_order',
          params: { product: item.name, quantity: reorderQuantity(item) },
          reason: `Заканчивается «${item.name}»: осталось ${item.quantity} ${item.unit}`,
          source: 'agent',
          dedupeKey: `restock-${item.id}`,
        }),
      );
    } catch (err) {
      // например, заказ выше лимита — агент не падает, тревога о складе всё равно уйдёт в отчёт
      console.error('🤖 Управляющий: не смог предложить заказ —', err.message);
    }
  }
  return found;
}
