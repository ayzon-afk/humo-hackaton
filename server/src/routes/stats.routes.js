import { Router } from 'express';
import { collection } from '../db/store.js';

export const statsRouter = Router();

const countBy = (items, field) =>
  items.reduce((acc, item) => {
    const key = item[field] ?? 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

function lastDays(items, days = 14) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    result.push({ day, count: items.filter((x) => String(x.createdAt).startsWith(day)).length });
  }
  return result;
}

statsRouter.get('/:collection', async (req, res) => {
  const items = await collection(req.params.collection).all();
  res.json({
    total: items.length,
    byStatus: countBy(items, 'status'),
    byCategory: countBy(items, 'category'),
    timeline: lastDays(items),
  });
});
