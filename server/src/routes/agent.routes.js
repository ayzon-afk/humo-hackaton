import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/security.js';
import { emit } from '../realtime/socket.js';
import { buildReport, listReports, snapshot } from '../agent/reporter.js';
import { agentStatus } from '../agent/scheduler.js';
import { notifyReport } from '../agent/notify.js';

/** AI-агент: живое состояние, история отчётов, ручной запуск */
export const agentRouter = Router();

agentRouter.use(requireAuth);

agentRouter.get('/status', async (_req, res) => res.json({ ...agentStatus(), ...(await snapshot()) }));

agentRouter.get('/reports', async (_req, res) => res.json(await listReports()));

agentRouter.post('/run', requireRole('admin', 'manager'), aiLimiter, async (_req, res) => {
  const report = await buildReport({ reason: 'manual' });
  emit('agent:report', report);
  notifyReport(report);
  res.status(201).json(report);
});
