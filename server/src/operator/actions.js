/**
 * Что AI-управляющий умеет делать сам. Каждое действие:
 * description + parameters — для модели (tools), schema — проверка параметров,
 * prepare — поиск и расчёт ДО подтверждения, execute — выполнение ПОСЛЕ «да» человека.
 * Новое действие под тему = ещё один объект в ACTIONS.
 */
import { z } from 'zod';
import { collection } from '../db/store.js';
import { config } from '../config.js';
import { emit } from '../realtime/socket.js';
import { buildReport } from '../agent/reporter.js';
import { sendTelegram } from '../agent/notify.js';
import { httpError } from '../utils/httpError.js';
import { changeQuantity, findProduct } from './inventory.js';
import { charge, money } from './wallet.js';

const records = () => collection(config.agent.collection);
const now = () => new Date().toISOString();
const escapeHtml = (text) => text.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]);

const params = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required });

export const ACTIONS = {
  place_order: {
    title: 'Заказ у поставщика',
    description: 'Заказать товар у поставщика: деньги списываются со счёта бизнеса, остаток на складе пополняется',
    parameters: params({
      product: { type: 'string', description: 'Название товара со склада' },
      quantity: { type: 'integer', description: 'Сколько единиц заказать' },
    }),
    schema: z.object({ product: z.string().trim().min(1), quantity: z.coerce.number().int().min(1).max(100_000) }),
    prepare({ product, quantity }) {
      const item = findProduct(product);
      if (!item) throw httpError(404, `Товар «${product}» не найден на складе`);
      const amount = item.unitPrice * quantity;
      return {
        params: { productId: item.id, product: item.name, quantity },
        amount,
        summary: `Заказать ${quantity} ${item.unit} «${item.name}» у ${item.supplier} за ${money(amount)}`,
      };
    },
    execute({ productId, product, quantity }, { amount }) {
      const balance = charge(amount, `Заказ: ${product}`);
      const item = changeQuantity(productId, quantity);
      collection('orders').insert({ productId, product, quantity, amount, supplier: item.supplier });
      return `Заказ оформлен: ${product}, ${quantity} ${item.unit}. На складе ${item.quantity}, на счёте ${money(balance)}`;
    },
  },

  create_task: {
    title: 'Новая задача',
    description: 'Создать запись (задачу, заявку) в системе с приоритетом от 1 до 5',
    parameters: params(
      {
        title: { type: 'string', description: 'Короткое название, 3–6 слов' },
        description: { type: 'string', description: 'Подробности' },
        priority: { type: 'integer', description: '1 — не срочно, 5 — очень срочно' },
      },
      ['title'],
    ),
    schema: z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().max(2000).optional(),
      priority: z.coerce.number().int().min(1).max(5).default(3),
    }),
    prepare: (p) => ({ params: p, amount: 0, summary: `Создать задачу «${p.title}», приоритет ${p.priority}` }),
    execute(p, { by }) {
      const item = records().insert({
        status: 'new',
        ...p,
        userId: null,
        history: [{ type: 'created', by, at: now() }],
      });
      emit(`${config.agent.collection}:created`, item);
      return `Задача «${item.title}» создана`;
    },
  },

  set_status: {
    title: 'Смена статуса',
    description: 'Поменять статус записи в системе, например закрыть задачу',
    parameters: params({
      record: { type: 'string', description: 'Название записи или её id' },
      status: { type: 'string', description: 'Новый статус из списка статусов системы' },
    }),
    schema: z.object({ record: z.string().trim().min(1), status: z.string().trim().min(1).max(40) }),
    prepare({ record, status }) {
      const needle = record.toLowerCase();
      const item = records().byId(record) ?? records().findOne((i) => String(i.title).toLowerCase().includes(needle));
      if (!item) throw httpError(404, `Запись «${record}» не найдена`);
      return {
        params: { id: item.id, title: item.title, status },
        amount: 0,
        summary: `Перевести «${item.title}» в статус «${status}»`,
      };
    },
    execute({ id, status }, { by }) {
      const current = records().byId(id);
      if (!current) throw httpError(404, 'Запись уже удалена');
      const entry = { type: 'changed', by, at: now(), field: 'status', from: current.status, to: status };
      const item = records().update(id, { status, history: [...(current.history ?? []), entry] });
      emit(`${config.agent.collection}:updated`, item);
      return `Статус записи «${item.title}» изменён`;
    },
  },

  notify_team: {
    title: 'Сообщение команде',
    description: 'Отправить сообщение команде в Telegram',
    parameters: params({ text: { type: 'string', description: 'Текст сообщения' } }),
    schema: z.object({ text: z.string().trim().min(1).max(1000) }),
    prepare: (p) => ({ params: p, amount: 0, summary: `Написать команде: «${p.text}»` }),
    async execute({ text }) {
      const sent = await sendTelegram(`<b>${config.operator.name}</b>\n${escapeHtml(text)}`);
      return sent ? 'Сообщение отправлено в Telegram' : 'Telegram не подключён, сообщение сохранено в журнале';
    },
  },

  run_report: {
    title: 'Отчёт',
    description: 'Сформировать отчёт о бизнесе прямо сейчас',
    parameters: params({}),
    schema: z.object({}),
    autoApprove: true, // безопасное действие: ничего не тратит, подтверждение не нужно
    prepare: () => ({ params: {}, amount: 0, summary: 'Сформировать отчёт' }),
    async execute() {
      const report = await buildReport({ reason: 'manual' });
      emit('agent:report', report);
      return `${report.ai.headline}. ${report.ai.summary}`;
    },
  },
};

/** Описание действий для модели в формате OpenAI tools */
export const toolDefinitions = () =>
  Object.entries(ACTIONS).map(([name, action]) => ({
    type: 'function',
    function: { name, description: action.description, parameters: action.parameters },
  }));
