import { config } from '../config.js';

// Любой OpenAI-совместимый API (Gemini / Groq / OpenAI / OpenRouter).
// Если ключа нет или AI упал — отдаём DEMO-ответ, чтобы демо на сцене НЕ ломалось.

export const aiEnabled = () => Boolean(config.ai.baseUrl && config.ai.apiKey && config.ai.model);

async function callModel({ messages, model = config.ai.model, json = false }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.ai.timeoutMs);
  try {
    const res = await fetch(`${config.ai.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timer);
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error('AI вернул не JSON');
  }
}

async function safely(fn, fallback) {
  if (!aiEnabled()) return { ...fallback, demo: true };
  try {
    return await fn();
  } catch (err) {
    console.error('🤖 AI error:', err.message);
    return { ...fallback, demo: true, error: err.message };
  }
}

/** Диалог. messages: [{ role: 'user'|'assistant', content }] */
export function chat({
  messages = [],
  system = 'Ты полезный ассистент. Отвечай кратко и по делу на языке пользователя.',
}) {
  return safely(
    async () => ({ reply: await callModel({ messages: [{ role: 'system', content: system }, ...messages] }) }),
    { reply: 'DEMO: AI-ключ не задан. Добавь AI_API_KEY в server/.env — и здесь будет реальный ответ.' },
  );
}

/** Структурный анализ текста → JSON. instruction описывает, какие поля вернуть. */
export function analyze({ text, instruction }) {
  const system = `Ты аналитик. ${instruction}\nВерни ТОЛЬКО валидный JSON без пояснений.`;
  return safely(
    async () => ({
      result: parseJson(
        await callModel({
          json: true,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: text },
          ],
        }),
      ),
    }),
    { result: { category: 'city', priority: 3, summary: String(text || '').slice(0, 120), tags: ['demo'] } },
  );
}

/** Анализ фото → JSON. imageBase64 без префикса data: */
export function vision({ imageBase64, mimeType = 'image/jpeg', prompt }) {
  const instruction = `${prompt}\nВерни ТОЛЬКО валидный JSON.`;
  return safely(
    async () => ({
      result: parseJson(
        await callModel({
          model: config.ai.visionModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: instruction },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              ],
            },
          ],
        }),
      ),
    }),
    { result: { label: 'demo', confidence: 0.9, description: 'DEMO: подключи vision-модель в .env' } },
  );
}
