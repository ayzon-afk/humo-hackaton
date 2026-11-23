# PROJECT NAME

[![CI](https://github.com/ayzon-afk/humo-hackaton/actions/workflows/ci.yml/badge.svg)](https://github.com/ayzon-afk/humo-hackaton/actions/workflows/ci.yml)

> Одна фраза: какую проблему решаем и для кого. _(заполняется в день хакатона)_

**Демо:** https://humo-hackaton-production.up.railway.app · логин `admin@demo.uz` / `admin123`

Команда **AYZON** · Humo Arena Hackathon 2026

---

## Возможности

- **CRM-система** — обзор с трендами, таблица с фильтрами и поиском, карточка записи с историей изменений, карта, команда и роли, настройки
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
POST /api/ai/chat | /api/ai/analyze | /api/ai/vision
POST /api/upload                                  GET /api/health
```

WebSocket: `<collection>:created | updated | deleted`

## Документация

- [Архитектура](docs/ARCHITECTURE.md)
- [Стиль CRM](docs/STYLE_CRM.md) · [Стиль сайта](docs/STYLE_WEBSITE.md)
- [План дня](docs/DAY_PLAN.md) · [Разбор темы](docs/IDEA_CANVAS.md) · [Питч](docs/PITCH.md)
