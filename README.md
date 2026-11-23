# 🚀 Humo Arena Hackathon — стартовый шаблон AYZON

Готовый фундамент, чтобы завтра тратить время **на идею и вау-фичу**, а не на настройку.

**Стек:** Vue 3 + Vite + Tailwind 4 + DaisyUI 5 + Pinia · Express 5 + JWT + Socket.io · AI через любой OpenAI-совместимый API · Leaflet-карта Ташкента · Chart.js

## ⚡ Запуск (2 команды)

```bash
npm run install:all
npm run dev
```

- Фронт: http://localhost:5173 (логин уже подставлен: `admin@demo.uz` / `admin123`)
- API: http://localhost:5000/api/health
- С телефона в той же Wi-Fi: `http://<IP-ноутбука>:5173`

## 🤖 Подключить AI

В `server/.env` заполни `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` (примеры провайдеров там же).
Без ключа всё работает в **DEMO-режиме** — демо на сцене не упадёт, даже если AI отвалится.

## 🧩 Что уже есть

| Готово | Где |
|---|---|
| Лендинг под питч (название, слоган, цифра проблемы) | `client/src/config/project.js` |
| Логин / регистрация / роли (JWT) | `server/src/routes/auth.routes.js` |
| Универсальный CRUD для любой сущности | `COLLECTIONS=` в `server/.env` |
| Realtime: данные появляются у всех сами | `server/src/realtime/socket.js` |
| Дашборд со статистикой и графиками | `client/src/views/DashboardView.vue` |
| Карта Ташкента: клик → добавить точку | `client/src/views/MapPageView.vue` |
| AI-чат, AI-анализ текста → JSON, AI-анализ фото | `server/src/services/ai.service.js` |
| Загрузка файлов | `POST /api/upload` |
| Деплой одним сервисом (Render) | `render.yaml` |

## 🔁 Как адаптировать под тему за 15 минут

1. `client/src/config/project.js` — название, слоган, цифра проблемы, фичи.
2. `server/.env` → `COLLECTIONS=reports` (своя сущность) + то же в `project.mainCollection`.
3. `client/src/config/labels.js` — статусы и категории под тему.
4. `client/src/config/nav.js` — пункты меню.
5. `server/src/db/seed.js` — реалистичные демо-данные → `npm run seed`.
6. Системный промпт AI в `client/src/views/AiView.vue`.

## 📡 API

```
POST /api/auth/login | /api/auth/register      GET /api/auth/me
GET  /api/:collection?status=new&q=яма&limit=10&sort=-createdAt
GET|PATCH|DELETE /api/:collection/:id           POST /api/:collection
GET  /api/stats/:collection
POST /api/ai/chat     { messages:[{role,content}], system }
POST /api/ai/analyze  { text, instruction }  → { result: {...} }
POST /api/ai/vision   multipart: image, prompt → { result: {...} }
POST /api/upload      multipart: file → { url }
```

Socket-события: `<collection>:created | updated | deleted`

## 📚 Документы на день хакатона

- `docs/DAY_PLAN.md` — тайминг дня и чек-лист
- `docs/IDEA_CANVAS.md` — заполнить, как только объявят тему
- `docs/PITCH.md` — структура питча на 3 минуты + ответы жюри
