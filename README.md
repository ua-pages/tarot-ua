# Tarot Atlas (пет-проєкт для портфоліо)

Повноцінний full-stack застосунок про карти Таро українською мовою.

**Стек:**
- Бекенд: Node.js (vanilla HTTP), PostgreSQL, Gremlin (JanusGraph)
- Фронтенд: vanilla JS (Web Components), SPA з серверним рендерингом
- ШІ-тлумачення: OpenRouter / OpenAI (опціонально)

## Можливості

- **Карта дня** — детерміністична карта на кожен день
- **Розклади:** 3 карти («Минуле·Теперішнє·Майбутнє»), Пентаграма балансу (5 карт), Кохання та стосунки (5), Кар'єра та гроші (5)
- **ШІ-тлумачення** — цілісний аналіз розкладу через LLM (OpenRouter/OpenAI), з трьома тонами: психологічний, містичний, практичний; якщо ключ API не налаштовано — працює rule-based інтерпретатор
- **Бібліотека карт** — 78 карт з ілюстраціями, значеннями й ключовими словами
- **Авторизація** — JWT (реєстрація, логін, профіль)
- **Журнал розкладів** — збереження, нотатки, обране
- **Публічні розклади** — share за slug + соціальна картка SVG
- **Аналітика** — PostHog (опціонально, без ключа працює без неї)

## Структура

- `apps/api` — Node.js API (vanilla HTTP, PostgreSQL, Gremlin)
- `apps/web` — vanilla JS SPA (Web Components)
- `infra` — docker-compose (PostgreSQL + Gremlin Server)

## Швидкий старт

```bash
# 1. Встановити залежності
npm install

# 2. (Опціонально) Запустити PostgreSQL + Gremlin
docker compose -f infra/docker-compose.yml up -d

# 3. Запустити API
node apps/api/server.js

# 4. В іншому терміналі — фронтенд
node apps/web/server.js
```

- **Web:** `http://localhost:5173`
- **API:** `http://localhost:3000`

Або через root `package.json`:

```bash
npm start     # фронтенд
npm start:api # API
```

## API endpoints

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/health` | Перевірка API |
| GET | `/api/auth/health` | Перевірка auth |
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Логін |
| GET | `/api/auth/me` | Профіль (auth) |
| GET | `/api/tarot/cards` | Список карт |
| GET | `/api/tarot/spreads` | Визначення розкладів |
| GET | `/api/tarot/draw?count=3&type=classic3` | Випадковий розклад |
| POST | `/api/tarot/interpretation` | ШІ-тлумачення |
| GET | `/api/tarot/card-of-day` | Карта дня |
| GET/POST | `/api/me/spreads` | Журнал розкладів (auth) |
| PATCH | `/api/me/spreads/:id/favorite` | Обране (auth) |
| PATCH | `/api/me/spreads/:id/note` | Нотатка (auth) |
| POST | `/api/share/spreads` | Створити публічний розклад |
| GET | `/api/share/spreads/:slug` | Отримати публічний розклад |
| GET | `/api/share/spreads/:slug/social-card.svg` | Social card |

## PostgreSQL

Endpoints за замовчуванням — `localhost:5432`. Змінні середовища:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=tarot
POSTGRES_PASSWORD=tarot
POSTGRES_DB=tarot
```

## JanusGraph (Gremlin)

Endpoint за замовчуванням — `ws://localhost:8182/gremlin`.
Якщо JanusGraph недоступний, API працює на локальному seed-наборі карт.

## ШІ-тлумачення

Підтримується OpenRouter та OpenAI-сумісні API. Налаштування:

```env
OPENROUTER_API_KEY=sk-or-...
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_MODEL=openai/gpt-4o-mini
```

Якщо ключ не вказано — застосунок використовує rule-based тлумачення.

## Аналітика

Опціональна аналітика через PostHog. Файл `apps/web/.env`:

```env
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://eu.i.posthog.com
VITE_ANALYTICS_ENABLED=true
```

Для вимкнення: `localStorage['tarot-analytics-opt-out'] = 'true'`.

## Що можна додати

- ребра зв'язків між картами (`influences`, `mirrors`, `blocks`)
- E2E тести
- перемикач мов (UA/EN)
