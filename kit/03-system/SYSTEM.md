# Система (CRM) — все страницы

Адрес: `/app/*`, вход: `/login`. Каркас: `layouts/AppLayout.vue` = `Sidebar` + контент (на телефоне — `Topbar` с меню).
Меню: `client/src/config/nav.js` (группы «Работа» и «Управление»).

## Страницы

| Страница        | URL              | Файл                       | Что на ней                                                                                                     | Ключевые компоненты                                                      |
| --------------- | ---------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Вход            | `/login`         | `views/LoginView.vue`      | Логин (демо-данные подставлены)                                                                                | —                                                                        |
| Обзор           | `/app`           | `views/DashboardView.vue`  | Приветствие по времени суток, главная цифра + тренд 14 дней, статусы с прогрессом, последние записи, категории | `LineChart`, `BreakdownList`, `StatusLabel`                              |
| Записи          | `/app/items`     | `views/ItemsView.vue`      | Фильтр-сегменты со счётчиками, поиск, таблица, создание в боковой панели                                       | `SegmentedControl`, `SearchField`, `ItemTable`, `SheetPanel`, `ItemForm` |
| Карточка записи | `/app/items/:id` | `views/ItemDetailView.vue` | Смена статуса, описание, AI-анализ, история изменений, детали, мини-карта                                      | `ItemHistory`, `ItemAiInsight`, `MapView`                                |
| Карта           | `/app/map`       | `views/MapPageView.vue`    | Карта Ташкента, клик = новая запись в точке, легенда/выбранная точка                                           | `MapView`, `SheetPanel`, `ItemForm`                                      |
| AI-агент        | `/app/agent`     | `views/AgentView.vue`      | Последний отчёт (вывод, метрики, 3 действия, тревоги), статус агента, живые тревоги, история отчётов           | `ReportCard`, `AlertList`                                                |
| Ассистент       | `/app/ai`        | `views/AiView.vue`         | Чат как iMessage + подсказки-вопросы                                                                           | `AiChat`                                                                 |
| Команда         | `/app/team`      | `views/TeamView.vue`       | Сотрудники, роли (меняет админ), добавление                                                                    | `MemberRow`, `InviteForm`                                                |
| Настройки       | `/app/settings`  | `views/SettingsView.vue`   | Профиль, тема, статус сервера и AI                                                                             | `SegmentedControl`                                                       |

## Сквозные возможности

- **Реальное время:** создание/изменение/удаление записи сразу видно на всех экранах (`stores/items.js` → socket). Новая строка подсвечивается, приходит тост.
- **История:** каждое изменение записи пишется в `history` (кто, когда, что было → что стало).
- **Роли:** `admin` (всё + команда), `manager` (может запускать отчёт агента), `user`.
- **Быстрые клавиши в панели:** Esc — закрыть, Ctrl/⌘+Enter — сохранить.
- **Тема:** светлая/тёмная, запоминается.

## Модель данных (запись)

```js
{
  id, createdAt, updatedAt,
  title, description, category, status, priority /* 1–5 */, lat, lng,
  userId, history: [{ type: 'created' | 'changed', by, at, field?, from?, to? }]
  // + любые поля под тему (схема пропускает лишние поля)
}
```

## Как адаптировать под тему

1. **Сущность:** `server/.env` → `COLLECTIONS=reports` и `client/src/config/project.js` → `mainCollection: 'reports'`.
2. **Статусы и категории:** `client/src/config/labels.js` (+ `AGENT_DONE_STATUS` если «решено» называется иначе).
3. **Новые поля:** добавить в `server/src/validation/schemas.js` (itemFields) → в `ItemForm.vue` (поле) → в `ItemTable.vue` (колонка) → в `ItemDetailView.vue` (`dl.props`).
4. **Названия меню и страниц:** `config/nav.js`, заголовки в `PageHeader` на страницах.
5. **Вторая сущность** (например, «Объекты» и «Заявки»): добавить в `COLLECTIONS=a,b` → API уже есть (`/api/b`) → скопировать `ItemsView` как основу.

## API

```
POST /api/auth/login | register       GET /api/auth/me
GET/POST /api/users   PATCH /api/users/:id                       (admin)
GET /api/:collection?status=&q=&limit=&sort=-createdAt
GET|PATCH|DELETE /api/:collection/:id     POST /api/:collection
GET /api/stats/:collection
GET /api/agent/status | /api/agent/reports     POST /api/agent/run   (admin, manager)
POST /api/ai/chat | analyze | vision      POST /api/upload      GET /api/health
```

WebSocket-события: `<collection>:created|updated|deleted`, `agent:report`, `agent:alert`.
