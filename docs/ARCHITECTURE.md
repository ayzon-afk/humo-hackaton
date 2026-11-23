# Архитектура

## Обзор

```
┌────────────── client (Vue 3 + Vite) ──────────────┐        ┌──────────── server (Express 5) ────────────┐
│ views/      страницы (CRM + сайт)                 │  HTTP  │ routes/      тонкие роутеры                │
│ components/ UI-кит, CRM-блоки, сайт, сцены        │ ─────▶ │ middleware/  auth, validate, security      │
│ stores/     Pinia: auth, items                    │        │ validation/  zod-схемы входных данных      │
│ api/        axios-клиенты по ресурсам             │ ◀───── │ services/    бизнес-логика (auth, ai)      │
│                                                   │        │ agent/       мониторинг, тревоги, отчёты   │
│ composables/ тема, тосты, формат, scroll-прогресс │  WS    │ db/          PostgreSQL / JSON + миграции  │
│ styles/     tokens → base → components → site     │        │ realtime/    socket.io события             │
└───────────────────────────────────────────────────┘        └────────────────────────────────────────────┘
```

В проде это **один сервис**: Express отдаёт API, WebSocket и собранный фронт (`client/dist`).

## Принципы

| Принцип                                  | Как реализован                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| Один источник правды для дизайна         | `client/src/styles/tokens.css` — цвета, шрифт, отступы, радиусы, движение                   |
| Конфиг вместо правок кода                | `config/project.js`, `config/story.js`, `config/labels.js`, `config/nav.js`                 |
| Маленькие файлы с одной ответственностью | компонент = одна задача; страницы только собирают компоненты                                |
| Валидация на входе                       | каждый `POST/PATCH` проходит zod-схему (`server/src/validation/schemas.js`)                 |
| Безопасность по умолчанию                | helmet, rate-limit на вход и AI, JWT, хеши bcrypt, пароли не уходят на клиент               |
| Демо не падает                           | AI без ключа или при ошибке отвечает демо-ответом (`services/ai.service.js`)                |
| Реальное время                           | CRUD шлёт `<collection>:created/updated/deleted`, клиент обновляется без перезагрузки       |
| Журнал изменений                         | каждое изменение записи пишется в `history` (кто, когда, что)                               |
| Хранилище за интерфейсом                 | `db/store.js`: PostgreSQL при `DATABASE_URL`, иначе JSON-файл; код не знает, что под ним    |
| Без гонок                                | условные UPDATE (`expected`): двойное «да», параллельные списания и правки не ломают данные |

## Поток данных: создание записи

1. `ItemForm` собирает данные → `useItemsStore().create()` → `POST /api/items`
2. `validate(itemCreateSchema)` чистит и проверяет тело запроса
3. `crud.routes` сохраняет запись с `history: [created]` и шлёт `items:created` по WebSocket
4. Все открытые экраны (таблица, карта, дашборд) получают событие и обновляются, новая строка подсвечивается

## Структура клиента

```
client/src/
├─ config/        project, story, labels, nav, roles — всё, что меняется под тему
├─ styles/        tokens.css, base.css, components/*.css, site.css, site-story.css
├─ components/
│  ├─ ui/         PageHeader, SegmentedControl, ChoiceChips, SheetPanel, StatusLabel, …
│  ├─ layout/     Sidebar, Topbar
│  ├─ items/      ItemTable, ItemForm, ItemHistory, ItemAiInsight
│  ├─ team/       MemberRow, InviteForm
│  ├─ charts/     LineChart, BreakdownList
│  ├─ map/        MapView (Leaflet)
│  ├─ ai/         AiChat, ChatMessage
│  ├─ agent/      ReportCard, AlertList
│  └─ site/       SiteNav, SiteHero, StoryScroll, StoryCard, StoryTimeline, scenes/*
└─ views/         Landing, Login, Dashboard, Items, ItemDetail, Map, Agent, Ai, Team, Settings
```

## Качество

```bash
npm run check   # lint + формат + тесты + сборка — то же самое, что CI на GitHub
```

- **ESLint** (`eslint.config.js`) + **Prettier** (`.prettierrc.json`) + `.editorconfig`
- **Тесты API** — Vitest + Supertest (`server/tests`): авторизация, валидация, CRUD, история, права, AI-фолбэк, агент (метрики, правила, расписание), заголовки безопасности
- **CI** — `.github/workflows/ci.yml` запускает всё на каждый push
