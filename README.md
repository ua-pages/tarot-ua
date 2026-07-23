# Tarot UA

Локальна карта дня українською для короткої особистої рефлексії.

Одна дата визначає одну карту та її положення. Користувач читає коротке
тлумачення, відповідає на запитання й за бажанням зберігає нотатку лише
у власному браузері.

Це інструмент для роздумів, а не передбачення.

## Принципи

**Local First • Lightweight First • Fast First • Focused First**

- Vanilla JavaScript, ESM і Web Components;
- без залежностей і без build step;
- без акаунта, сервера та обов'язкової аналітики;
- `localStorage` використовується лише для нотатки поточного дня.

## GitHub Pages

Сайт доступний за адресою: [https://ua-pages.github.io/tarot-ua/](https://ua-pages.github.io/tarot-ua/)

Деплой відбувається автоматично через GitHub Actions при пуші в гілку `main`.

## Локальний запуск

```bash
npm start
```

Відкрийте [http://localhost:5173/tarot-ua/](http://localhost:5173/tarot-ua/).

Перевірка:

```bash
npm test
```
