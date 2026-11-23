import { z } from 'zod';

/** Схемы входных данных. Всё, что приходит от клиента, проверяется здесь. */

const email = z.string().trim().toLowerCase().email('Некорректный email');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Введите пароль'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Имя — минимум 2 символа').max(60),
  email,
  password: z.string().min(6, 'Пароль — минимум 6 символов').max(100),
});

export const userCreateSchema = registerSchema.extend({
  role: z.enum(['admin', 'manager', 'user']).default('user'),
});

export const userUpdateSchema = z.object({
  role: z.enum(['admin', 'manager', 'user']).optional(),
  name: z.string().trim().min(2).max(60).optional(),
});

const itemFields = {
  title: z.string().trim().min(1, 'Добавьте название').max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(40).optional(),
  status: z.string().trim().max(40).optional(),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  lat: z.coerce.number().min(-90).max(90).nullable().optional(),
  lng: z.coerce.number().min(-180).max(180).nullable().optional(),
};

// passthrough: коллекции под тему хакатона могут иметь свои поля
export const itemCreateSchema = z.object(itemFields).passthrough();
export const itemUpdateSchema = z.object(itemFields).partial().passthrough();

export const aiChatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) }))
    .max(40)
    .default([]),
  system: z.string().max(4000).optional(),
});

export const aiAnalyzeSchema = z.object({
  text: z.string().trim().min(1, 'Нужен text').max(4000),
  instruction: z.string().max(2000).optional(),
});
