# Ссылки и доступы

## Проект

| Что                 | Ссылка                                                           |
| ------------------- | ---------------------------------------------------------------- |
| Рабочий сайт (прод) | https://humo-hackaton-production.up.railway.app                  |
| CRM (вход)          | https://humo-hackaton-production.up.railway.app/login            |
| Проверка сервера    | https://humo-hackaton-production.up.railway.app/api/health       |
| GitHub              | https://github.com/ayzon-afk/humo-hackaton                       |
| CI (проверки)       | https://github.com/ayzon-afk/humo-hackaton/actions               |
| Railway             | https://railway.com/project/3633a450-c494-45df-b188-3873f4dccb7e |
| Папка на ноутбуке   | `C:\Users\user\Desktop\humo`                                     |

## Демо-логины (создаются при первом запуске и пересоздаются при `npm run seed`)

| Роль          | Email          | Пароль   |
| ------------- | -------------- | -------- |
| Администратор | admin@demo.uz  | admin123 |
| Менеджер      | malika@demo.uz | demo123  |
| Сотрудник     | timur@demo.uz  | demo123  |

## Railway CLI (уже установлен и залогинен)

```bash
railway deployment list                 # статус сборок
railway logs                            # логи сервера
railway variables                       # посмотреть переменные
railway variables --set AI_API_KEY=...  # добавить ключ (вводит человек сам)
railway redeploy                        # перезапустить последнюю версию
```

## AI-провайдеры (OpenAI-совместимые)

| Провайдер                       | Где взять ключ                       | AI_BASE_URL                                               | AI_MODEL                  |
| ------------------------------- | ------------------------------------ | --------------------------------------------------------- | ------------------------- |
| Gemini (бесплатно, умеет фото)  | https://aistudio.google.com/apikey   | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-3.5-flash`        |
| Groq (бесплатно, очень быстрый) | https://console.groq.com/keys        | `https://api.groq.com/openai/v1`                          | `llama-3.3-70b-versatile` |
| OpenAI                          | https://platform.openai.com/api-keys | `https://api.openai.com/v1`                               | `gpt-4o-mini`             |

Ключ кладётся в `server/.env` и в Railway Variables. **Никогда не в код и не в git.**

## Telegram для отчётов агента (необязательно)

1. @BotFather → `/newbot` → токен → `TELEGRAM_BOT_TOKEN`
2. Написать боту любое сообщение, открыть `https://api.telegram.org/bot<токен>/getUpdates` → `chat.id` → `TELEGRAM_CHAT_ID`

## Документация библиотек

Vue https://vuejs.org · Pinia https://pinia.vuejs.org · Lucide-иконки https://lucide.dev/icons ·
Leaflet https://leafletjs.com · Chart.js https://www.chartjs.org · Zod https://zod.dev · Express https://expressjs.com
