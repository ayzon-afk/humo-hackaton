import { Router } from 'express';
import { config } from '../config.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/security.js';
import { demoSaleSchema, operatorCommandSchema, proposalDecisionSchema } from '../validation/schemas.js';
import { handleCommand } from '../operator/assistant.js';
import { buildBriefing } from '../operator/briefing.js';
import { pendingProposals, proposalHistory, resolve } from '../operator/proposals.js';
import { simulateSale, stock } from '../operator/inventory.js';
import { scanInventory } from '../operator/watcher.js';
import { getBalance } from '../operator/wallet.js';

/** AI-управляющий: команды голосом, брифинг, подтверждение действий, демо-сценарий */
export const operatorRouter = Router();

operatorRouter.use(requireAuth);

const canDecide = requireRole('admin', 'manager');

operatorRouter.get('/state', (_req, res) =>
  res.json({
    name: config.operator.name,
    balance: getBalance(),
    currency: config.operator.currency,
    maxAmount: config.operator.maxAmount,
    stock: stock().all(),
    pending: pendingProposals(),
    history: proposalHistory(),
  }),
);

operatorRouter.post('/command', aiLimiter, validate(operatorCommandSchema), async (req, res) =>
  res.json(await handleCommand(req.body.text)),
);

operatorRouter.get('/briefing', aiLimiter, async (_req, res) => res.json(await buildBriefing()));

operatorRouter.post('/proposals/:id/confirm', canDecide, validate(proposalDecisionSchema), async (req, res) =>
  res.json(await resolve(req.params.id, { approve: true, by: req.user.name })),
);

operatorRouter.post('/proposals/:id/reject', canDecide, validate(proposalDecisionSchema), async (req, res) =>
  res.json(await resolve(req.params.id, { approve: false, by: req.user.name })),
);

/** Демо на сцене: товар «продали» → агент сразу замечает и звонит */
operatorRouter.post('/demo/sale', canDecide, validate(demoSaleSchema), async (req, res) => {
  const item = simulateSale(req.body.productId);
  const proposals = await scanInventory();
  res.status(201).json({ item, proposal: proposals.find((p) => p.params.productId === item.id) ?? null });
});
