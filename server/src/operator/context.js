/** Снимок бизнеса для AI-управляющего: деньги, склад, записи, тревоги, ждущие решения. */
import { config } from '../config.js';
import { snapshot } from '../agent/reporter.js';
import { isLow, stock } from './inventory.js';
import { getBalance, money } from './wallet.js';
import { pendingProposals } from './proposals.js';

export async function businessContext() {
  const [{ metrics, alerts }, items, balance, pending] = await Promise.all([
    snapshot(),
    stock().all(),
    getBalance(),
    pendingProposals(),
  ]);
  return {
    balance: money(balance),
    limitPerAction: money(config.operator.maxAmount),
    stock: items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      min: i.minQuantity,
      unit: i.unit,
      price: i.unitPrice,
      low: isLow(i),
    })),
    records: {
      total: metrics.total,
      open: metrics.open,
      urgentOpen: metrics.highPriorityOpen,
      created24h: metrics.created24h,
      byStatus: metrics.byStatus,
    },
    // склад уже описан выше — тревогу о нём не повторяем
    alerts: alerts.filter((a) => a.key !== 'low-stock').map((a) => `${a.title}: ${a.detail}`),
    waitingForOwner: pending.map((p) => p.summary),
  };
}
