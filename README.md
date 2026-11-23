# PROJECT NAME

[![CI](https://github.com/ayzon-afk/humo-hackaton/actions/workflows/ci.yml/badge.svg)](https://github.com/ayzon-afk/humo-hackaton/actions/workflows/ci.yml)

> Одна фраза: какую проблему решаем и для кого. _(заполняется в день хакатона)_

**Демо:** https://humo-hackaton-production.up.railway.app · логин `admin@demo.uz` / `admin123`

Команда **AYZON** · Humo Arena Hackathon 2026

---

## Возможности

- **CRM-система** — обзор с трендами, таблица с фильтрами и поиском, карточка записи с историей изменений, карта, команда и роли, настройки
- **AI-агент** — круглосуточно следит за данными, поднимает тревоги и каждый день сам присылает отчёт руководителю (в CRM и Telegram)
- **AI-управляющий** — замечает проблему (товар заканчивается), «звонит» владельцу, голосом спрашивает «Заказать?» и после «да» сам выполняет действие. Голосовые команды, брифинг, журнал решений, лимит трат
- **AI** — автозаполнение формы по описанию, анализ записи, чат-ассистент. Без ключа работает в демо-режиме и не падает
- **Реальное время** — изменения появляются у всех пользователей мгновенно (WebSocket)
- **Сайт** — лендинг со scroll-историей: прокрутка перематывает сцены работы продукта
- **Дизайн в стиле Apple** — светлая и тёмная темы, единые токены, адаптив до 375px

## Стек

| Слой     | Технологии                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| Клиент   | Vue 3 (Composition API), Vite, Pinia, Vue Router, Tailwind 4 (только сетка), Lucide, Inter, Chart.js, Leaflet |
| Сервер   | Node.js, Express 5, Socket.io, JWT, bcrypt, Zod, Helmet, express-rate-limit                                   |
| Качество | ESLint, Prettier, Vitest + Supertest, GitHub Actions                                                          |
| Деплой   | Railway (один сервис: API + WebSocket + фронт)                                                                |

## Быстрый старт

```bash
npm run install:all   # зависимости корня, сервера и клиента
npm run dev           # сервер :5000 + клиент :5173
```

## Команды

| Команда                               | Что делает                                  |
| ------------------------------------- | ------------------------------------------- |
| `npm run dev`                         | Запуск для разработки                       |
| `npm run check`                       | Линтер + формат + тесты + сборка (как в CI) |
| `npm test`                            | Тесты API                                   |
| `npm run lint:fix` / `npm run format` | Автоисправление стиля кода                  |
| `npm run seed`                        | Пересоздать демо-данные                     |
| `npm run deploy`                      | Коммит + push на GitHub + деплой на Railway |

## Адаптация под тему (15 минут)

1. `client/src/config/project.js` — название, слоган, цифра проблемы, возможности
2. `client/src/config/story.js` — шаги scroll-истории на сайте
3. `client/src/config/labels.js` — статусы и категории
4. `server/.env` → `COLLECTIONS=` — своя сущность (и `project.mainCollection`)
5. `server/src/db/seed.js` — реалистичные демо-данные → `npm run seed`

## AI

`server/.env`: `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` — любой OpenAI-совместимый провайдер (Gemini, Groq, OpenAI, OpenRouter). Примеры — в `server/.env.example`.

## API

```
POST /api/auth/login | /api/auth/register        GET /api/auth/me
GET  /api/users        POST /api/users (admin)    PATCH /api/users/:id (admin)
GET  /api/:collection?status=new&q=текст&limit=10&sort=-createdAt
GET|PATCH|DELETE /api/:collection/:id             POST /api/:collection
GET  /api/stats/:collection
GET  /api/agent/status | /api/agent/reports      POST /api/agent/run
GET  /api/operator/state | /api/operator/briefing POST /api/operator/command
POST /api/operator/proposals/:id/confirm | reject  POST /api/operator/demo/sale
POST /api/ai/chat | /api/ai/analyze | /api/ai/vision
POST /api/upload                                  GET /api/health
```

WebSocket: `<collection>:created | updated | deleted`, `agent:report`, `agent:alert`, `operator:proposal | resolved`, `inventory:updated`

## Документация

- [Архитектура](docs/ARCHITECTURE.md)
- [Задача хакатона](kit/00-task/TASK.md) · [Всё о проекте — kit/](kit/README.md)
- [Стиль CRM](kit/02-design/STYLE_CRM.md) · [Стиль сайта](kit/02-design/STYLE_WEBSITE.md)
- [AI-агент](kit/05-ai-agent/AI_AGENT.md) · [AI-управляющий](kit/05-ai-agent/AI_OPERATOR.md) · [Правила кода](kit/06-code-rules/CODE_RULES.md) · [Питч](kit/08-pitch/PITCH.md)
