import { describe, expect, it, vi } from 'vitest';
import { adminAuth, api } from './helpers.js';
import { config } from '../src/config.js';
import { collection } from '../src/db/store.js';
import { findProduct } from '../src/operator/inventory.js';
import { propose } from '../src/operator/proposals.js';
import { scanInventory } from '../src/operator/watcher.js';

const state = async (headers) => (await api().get('/api/operator/state').set(headers)).body;
const command = async (headers, text) => (await api().post('/api/operator/command').set(headers).send({ text })).body;

describe('operator: склад и звонок агента', () => {
  it('товар ниже минимума → одно предложение заказа, без дублей', async () => {
    await scanInventory();
    await scanInventory();
    const eggs = await findProduct('яйца');
    const pending = (await state(await adminAuth())).pending.filter((p) => p.params.productId === eggs.id);
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({ action: 'place_order', source: 'agent' });
    expect(pending[0].speech).toMatch(/Заканчивается/);
  });

  it('«да» владельца: деньги списаны, склад пополнен, решение в журнале', async () => {
    const headers = await adminAuth();
    const before = await state(headers);
    const proposal = before.pending.find((p) => p.source === 'agent');
    const eggsBefore = (await findProduct('яйца')).quantity;

    const res = await api().post(`/api/operator/proposals/${proposal.id}/confirm`).set(headers).send({});
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');

    const after = await state(headers);
    expect(after.balance).toBe(before.balance - proposal.amount);
    expect((await findProduct('яйца')).quantity).toBe(eggsBefore + proposal.params.quantity);
    expect(after.history[0].id).toBe(proposal.id);
  });

  it('повторное «да» не выполняет действие второй раз', async () => {
    const headers = await adminAuth();
    const [done] = (await state(headers)).history;
    const res = await api().post(`/api/operator/proposals/${done.id}/confirm`).set(headers).send({});
    expect(res.status).toBe(409);
  });

  it('сотрудник не может подтверждать траты', async () => {
    const login = await api().post('/api/auth/login').send({ email: 'timur@demo.uz', password: 'demo123' });
    const proposal = await propose({ action: 'place_order', params: { product: 'вода', quantity: 2 } });
    const res = await api()
      .post(`/api/operator/proposals/${proposal.id}/confirm`)
      .set({ Authorization: `Bearer ${login.body.token}` })
      .send({});
    expect(res.status).toBe(403);
  });

  it('сумма выше лимита не предлагается', async () => {
    await expect(propose({ action: 'place_order', params: { product: 'молоко', quantity: 100_000 } })).rejects.toThrow(
      /лимита/,
    );
  });
});

describe('operator: голосовые команды без AI-ключа', () => {
  it('«Закажи 20 молока» → предложение на 20 шт, ждёт подтверждения', async () => {
    const body = await command(await adminAuth(), 'Закажи 20 молока');
    expect(body.proposals).toHaveLength(1);
    expect(body.proposals[0]).toMatchObject({ status: 'pending', params: { product: 'Молоко 1 л', quantity: 20 } });
  });

  it('«Создай задачу: проверить кассу» → после «да» запись появляется в системе', async () => {
    const headers = await adminAuth();
    const { proposals } = await command(headers, 'Создай задачу: проверить кассу');
    await api().post(`/api/operator/proposals/${proposals[0].id}/confirm`).set(headers).send({});
    const items = await api().get('/api/items?q=проверить кассу');
    expect(items.body[0].history[0].type).toBe('created');
  });

  it('товар находится в любом падеже: «яиц» → «Яйца 10 шт»', async () => {
    expect((await findProduct('яиц')).name).toBe('Яйца 10 шт');
    expect((await findProduct('молока')).name).toBe('Молоко 1 л');
  });

  it('неизвестный товар — понятный ответ, а не ошибка', async () => {
    const body = await command(await adminAuth(), 'Закажи 5 бананов');
    expect(body.proposals).toEqual([]);
    expect(body.reply).toMatch(/не найден/);
  });

  it('пустая команда отклоняется', async () => {
    const res = await api()
      .post('/api/operator/command')
      .set(await adminAuth())
      .send({ text: ' ' });
    expect(res.status).toBe(400);
  });

  it('брифинг работает без ключа', async () => {
    const res = await api()
      .get('/api/operator/briefing')
      .set(await adminAuth());
    expect(res.body).toMatchObject({ source: 'rules' });
    expect(res.body.text).toMatch(/На счёте/);
  });
});

describe('operator: с AI-ключом (ответ модели подменён)', () => {
  /** Включить «AI» на время теста: fetch отвечает заданным message */
  async function withModel(response, run) {
    const original = { ...config.ai };
    Object.assign(config.ai, { baseUrl: 'http://ai.test', apiKey: 'test', model: 'test' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response),
    );
    try {
      return await run();
    } finally {
      vi.unstubAllGlobals();
      Object.assign(config.ai, original);
    }
  }

  it('модель вызывает функцию → предложение ждёт «да», а не выполняется сразу', async () => {
    const message = {
      content: 'Оформляю заказ воды.',
      tool_calls: [{ function: { name: 'place_order', arguments: '{"product":"Вода 1,5 л","quantity":12}' } }],
    };
    const ok = { ok: true, json: async () => ({ choices: [{ message }] }) };
    const body = await withModel(ok, async () => command(await adminAuth(), 'Нужна вода на выходные'));
    expect(body.source).toBe('ai');
    expect(body.reply).toBe('Оформляю заказ воды.');
    expect(body.proposals[0]).toMatchObject({ status: 'pending', params: { product: 'Вода 1,5 л', quantity: 12 } });
  });

  it('модель недоступна → отвечаем по правилам, демо не падает', async () => {
    const down = { ok: false, status: 503, text: async () => 'unavailable' };
    const body = await withModel(down, async () => command(await adminAuth(), 'Закажи 3 сахара'));
    expect(body.source).toBe('rules');
    expect(body.proposals[0].params.quantity).toBe(3);
  });
});

describe('operator: демо и деньги', () => {
  it('демо-продажа: товар уходит ниже минимума, агент сразу предлагает заказ', async () => {
    const res = await api()
      .post('/api/operator/demo/sale')
      .set(await adminAuth())
      .send({});
    expect(res.status).toBe(201);
    expect(res.body.item.quantity).toBeLessThanOrEqual(res.body.item.minQuantity);
    expect(res.body.proposal).toMatchObject({ status: 'pending', source: 'agent' });
  });

  it('не хватает денег → действие не выполнено, баланс не тронут', async () => {
    const headers = await adminAuth();
    const [wallet] = await collection('wallet').all();
    await collection('wallet').update(wallet.id, { balance: 1000 });

    const proposal = await propose({ action: 'place_order', params: { product: 'сахар', quantity: 1 } });
    const res = await api().post(`/api/operator/proposals/${proposal.id}/confirm`).set(headers).send({});
    expect(res.body.status).toBe('failed');
    expect(res.body.result).toMatch(/Не хватает денег/);
    expect((await state(headers)).balance).toBe(1000);
  });

  it('закрыт без авторизации', async () => {
    expect((await api().get('/api/operator/state')).status).toBe(401);
  });
});
