# 🧪 Модульні тести Tarot Engine (без залежностей)

> Чисті unit-тести на ванільному JavaScript — без Jest, Babel, npm залежностей.

## 📋 Що протестовано

**30 тестів, 100% успіх:**
- ✅ Управління картами (5 тестів)
- ✅ Розклади (4 тести)
- ✅ Витяг карт (6 тестів)
- ✅ Карта дня (5 тестів)
- ✅ Інтерпретація (7 тестів)
- ✅ Стрес-тести (3 тести)

## 🚀 Запуск

```bash
# Перейти у директорію проекту
cd apps/web

# Запустити тести (потрібен Node.js)
node tarot-engine.test.js
```

## 📁 Структура файлів

```
apps/web/
├── test-runner.js           # Мінімалістичний test runner (~80 рядків)
├── tarot-engine.test.js     # Всі тести
└── public/js/services/
    └── tarot-engine.js      # Модуль під тестування
```

## 🎯 Особливості

### 1. **Без зовнішніх залежностей**
- Жодних npm пакетів
- Жодних бандлерів (Webpack, Parcel, Vite)
- Жодного Babel
- 純 Node.js 22+

### 2. **Мінімалістичний runner**
- 80 рядків коду
- Простий API: `describe()`, `test()`, `assert*()`
- Кольорові вихідні дані (✅ ❌)

### 3. **ES Modules**
- Нативна підтримка `import/export`
- Жодних CommonJS трансформацій

## ✅ Приклад тесту

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

## 🔍 Доступні асерти

```javascript
runner.assertEquals(actual, expected, message)       // Строга рівність
runner.assertArrayLength(arr, length, message)       // Довжина масиву
runner.assertIncludes(arr, value, message)           // Елемент в масиві
runner.assertTrue(condition, message)                // true
runner.assertFalse(condition, message)               // false
runner.assertTypeOf(value, type, message)            // typeof
runner.assertHasProperty(obj, prop, message)         // obj.hasOwnProperty
runner.assertDeepEqual(actual, expected, message)    // JSON.stringify
```

## 📊 Вихідні дані

```
🧪 Запуск тестів...

📦 tarot-engine: Управління картами
  ✅ TAROT_SEED містить 78 карт
  ✅ кожна карта має необхідні властивості
  ...

════════════════════════════════════════════════════════════
📊 Результати: 30/30 пройшло
✅ Усі тести пройшли!
```

## 🎓 Навчальна цінність

Цей test runner демонструє:
- ✅ Як писати тести без фреймворків
- ✅ Принципи unit-тестування
- ✅ Обробка помилок і аserтів
- ✅ Структурування тестів (describe/test)
- ✅ Чиста архітектура кода

## 🔄 Розширення

Щоб додати більше тестів:

1. Відкрити `tarot-engine.test.js`
2. Додати новий блок:
```javascript
runner.describe('категорія', () => {
  runner.test('специфічний тест', () => {
    // тест тут
  });
});
```
3. Запустити: `node tarot-engine.test.js`

## 🚀 Наступні кроки

- [ ] Написати тести для `utils.js`
- [ ] Написати тести для `constants/`
- [ ] Добавити тести для інтеграції
- [ ] Настроить CI (GitHub Actions)
- [ ] Генерировать звіт покриття

---

**Створено:** 2026-06-14  
**Мова:** JavaScript (ES Modules)  
**Node.js:** 22+  
**Залежностей:** 0 ✅
