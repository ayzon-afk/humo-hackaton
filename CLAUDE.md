# CLAUDE.md — память проекта для Claude Code

Хакатон **Humo Arena, Ташкент, 24.11.2026**. Команда **AYZON**. Тема объявляется в день хакатона →
она записывается в `kit/00-task/TASK.md`. **Прочитай TASK.md перед любой работой.**

## Ссылки

- Прод: https://humo-hackaton-production.up.railway.app (логин `admin@demo.uz` / `admin123`)
- GitHub: https://github.com/ayzon-afk/humo-hackaton (публичный, ветка `main`)
- Railway: проект `hopeful-vision`, сервис `humo-hackaton`
- Всё остальное: `kit/01-links/LINKS.md`

## Команды

```bash
npm run dev        # сервер :5000 + клиент :5173
npm run check      # lint + prettier + тесты + сборка — ОБЯЗАТЕЛЬНО перед деплоем
npm run lint:fix && npm run format   # автоисправление
npm run seed       # пересоздать демо-данные
npm run deploy     # коммит + push + деплой на Railway (одной командой)
```

## Стек

Vue 3 (Composition API, `<script setup>`) + Vite + Pinia + Vue Router + Tailwind 4 (только сетка) · Express 5 + Socket.io + Zod + JWT ·
хранилище — PostgreSQL при `DATABASE_URL`, иначе JSON-файл (`server/src/db/store.js`, миграции в `server/src/db/migrations/`) · AI — любой OpenAI-совместимый API (`server/src/services/ai.service.js`).

## Где что лежит

| Что                                       | Где                                                       |
| ----------------------------------------- | --------------------------------------------------------- |
| Тема, задача, план дня                    | `kit/00-task/`                                            |
| Дизайн-система, правила CRM и сайта       | `kit/02-design/` + `client/src/styles/tokens.css`         |
| Описание всех страниц системы             | `kit/03-system/SYSTEM.md`                                 |
| Описание сайта и scroll-истории           | `kit/04-site/SITE.md`                                     |
| AI-агент (мониторинг + ежедневные отчёты) | `kit/05-ai-agent/` + `server/src/agent/`                  |
| AI-управляющий (голос, звонки, действия)  | `kit/05-ai-agent/AI_OPERATOR.md` + `server/src/operator/` |
| Правила кода для AI-проверки              | `kit/06-code-rules/CODE_RULES.md`                         |
| Демо-данные                               | `kit/07-data/DATA.md` + `server/src/db/seed.js`           |
| Питч                                      | `kit/08-pitch/PITCH.md`                                   |
| Готовые промпты по этапам                 | `kit/09-claude-prompts/PROMPTS.md`                        |
| Архитектура                               | `docs/ARCHITECTURE.md`                                    |

## Правила, которые нельзя нарушать

1. **Дизайн только из токенов** (`var(--accent)`, `var(--space-4)` …). Никаких hex-цветов в компонентах, градиентов, glow, эмодзи вместо иконок. Иконки — `lucide-vue-next`.
2. **Палитра: синий `#0071E3` + белый.** Одна `.btn-primary` на экран. Статусы — точка + текст.
3. **Маленькие файлы с одной задачей.** Страница (`views/`) только собирает компоненты. Компонент > ~150 строк → разбить.
4. **Всё, что меняется под тему, — в `client/src/config/*`**, а не в вёрстке.
5. **Каждый новый POST/PATCH — через zod-схему** в `server/src/validation/schemas.js` + `validate()`.
6. **Новая логика на сервере → тест** в `server/tests/`. `npm run check` должен быть зелёным.
7. Тексты интерфейса — на русском, кнопки — глаголом («Добавить запись»), без «Успешно!» и «Пожалуйста».
8. Не коммитить `.env`, ключи, токены. Ключи — только в `server/.env` и в Variables на Railway.
9. Демо не должно падать: AI без ключа → демо-ответ, ошибки → понятный тост.

## Как работать над задачей

1. Прочитать `kit/00-task/TASK.md` → понять, какую фичу делаем и зачем.
2. Найти похожий готовый пример в коде (страница, компонент, роут) и повторить его стиль.
3. Сделать маленький шаг → `npm run dev` → проверить в браузере → `npm run check`.
4. `npm run deploy` после каждой рабочей фичи (не копить до конца).
