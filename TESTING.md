# Модульні тести Tarot Engine (без залежностей)

Чисті unit-тести на ванільному JavaScript — без Jest, Babel, npm залежностей.

## Що протестовано

**30 тестів, 100% успіх:**
- Управління картами (5 тестів)
- Розклади (4 тести)
- Витяг карт (6 тестів)
- Карта дня (5 тестів)
- Інтерпретація (7 тестів)
- Локальна нотатка (4 тести)
- Стрес-тести (3 тести)

## Запуск

```bash
# З кореня проекту
node tarot-engine.test.js
```

## Структура файлів

```
tarot-ua/
├── test-runner.js               # Мінімалістичний test runner (~142 рядки)
├── tarot-engine.test.js          # Всі тести (імпортує модулі з public/)
└── public/js/services/
    ├── tarot-engine.js           # Модуль під тестування
    └── daily-reflection.js       # Модуль під тестування
```

## Особливості

### 1. Без зовнішніх залежностей
- Жодних npm пакетів
- Жодних бандлерів (Webpack, Parcel, Vite)
- Жодного Babel
- Чистий Node.js 22+

### 2. Мінімалістичний runner
- 142 рядки коду
- Простий API: `describe()`, `test()`, `assert*()`
- Кольорові вихідні дані

### 3. ES Modules
- Нативна підтримка `import/export`
- Жодних CommonJS трансформацій

## Приклад тесту

```javascript
runner.describe('tarot-engine: Управління картами', () => {
  runner.test('TAROT_SEED містить 78 карт', () => {
    runner.assertArrayLength(TAROT_SEED, 78, 'TAROT_SEED мати 78 карт');
  });

  runner.test('кожна карта має id', () => {
    TAROT_SEED.forEach((card) => {
      runner.assertHasProperty(card, 'id', 'карта має id');
    });
  });
});
```

## Наступні кроки

- [ ] Тести для `utils.js`
- [ ] Тести для `api.js` (local-only заглушки)
- [ ] Інтеграційні тести (рендеринг компонентів)
- [ ] GitHub Actions CI

---

**Створено:** 2026-06-14
**Мова:** JavaScript (ES Modules)
**Node.js:** 22+
**Залежностей:** 0
