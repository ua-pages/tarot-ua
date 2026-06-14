import {
  TAROT_SEED,
  SPREAD_DEFINITIONS,
  getCards,
  getSpreadDefinitions,
  drawSpread,
  getCardOfDay,
  generateInterpretation,
} from './public/js/services/tarot-engine.js';
import { runner } from './test-runner.js';

// === Карти ===
runner.describe('tarot-engine: Управління картами', () => {
  runner.test('TAROT_SEED містить 78 карт', () => {
    runner.assertArrayLength(TAROT_SEED, 78, 'TAROT_SEED мати 78 карт');
  });

  runner.test('кожна карта має необхідні властивості', () => {
    TAROT_SEED.forEach((card, idx) => {
      runner.assertHasProperty(card, 'id', `карта ${idx} має id`);
      runner.assertHasProperty(card, 'name', `карта ${idx} має name`);
      runner.assertHasProperty(card, 'arcana', `карта ${idx} має arcana`);
      runner.assertHasProperty(card, 'keywords', `карта ${idx} має keywords`);
      runner.assertHasProperty(card, 'meaningUpright', `карта ${idx} має meaningUpright`);
      runner.assertHasProperty(card, 'meaningReversed', `карта ${idx} має meaningReversed`);
      runner.assertHasProperty(card, 'image', `карта ${idx} має image`);
    });
  });

  runner.test('getCards повертає правильну кількість', () => {
    runner.assertArrayLength(getCards(), 78, 'getCards() повинен повернути 78');
    runner.assertArrayLength(getCards(22), 22, 'getCards(22) повинен повернути 22');
    runner.assertArrayLength(getCards(1), 1, 'getCards(1) повинен повернути 1');
  });

  runner.test('arcana тип major або minor', () => {
    TAROT_SEED.forEach((card) => {
      runner.assertTrue(
        card.arcana === 'major' || card.arcana === 'minor',
        `arcana для ${card.name} має бути major або minor`
      );
    });
  });

  runner.test('перша карта - The Fool', () => {
    runner.assertEquals(getCards(1)[0].id, 'the-fool', 'перша карта має id the-fool');
  });
});

// === Розклади ===
runner.describe('tarot-engine: Розклади', () => {
  runner.test('SPREAD_DEFINITIONS містить 4 розклади', () => {
    runner.assertArrayLength(SPREAD_DEFINITIONS, 4, 'SPREAD_DEFINITIONS має 4 розклади');
  });

  runner.test('кожен розклад має необхідні властивості', () => {
    SPREAD_DEFINITIONS.forEach((spread, idx) => {
      runner.assertHasProperty(spread, 'id', `розклад ${idx} має id`);
      runner.assertHasProperty(spread, 'title', `розклад ${idx} має title`);
      runner.assertHasProperty(spread, 'count', `розклад ${idx} має count`);
      runner.assertHasProperty(spread, 'positions', `розклад ${idx} має positions`);
      runner.assertEquals(
        spread.positions.length,
        spread.count,
        `розклад ${spread.id}: positions.length === count`
      );
    });
  });

  runner.test('getSpreadDefinitions повертає всі розклади', () => {
    const spreads = getSpreadDefinitions();
    runner.assertArrayLength(spreads, 4, 'getSpreadDefinitions() повинен повернути 4');
    const spreadIds = spreads.map(s => s.id);
    runner.assertIncludes(spreadIds, 'classic3', 'має classic3');
    runner.assertIncludes(spreadIds, 'pentagram5', 'має pentagram5');
  });

  runner.test('позиції розкладу мають структуру', () => {
    SPREAD_DEFINITIONS.forEach((spread) => {
      spread.positions.forEach((pos, idx) => {
        runner.assertHasProperty(pos, 'name', `позиція ${idx} має name`);
        runner.assertHasProperty(pos, 'description', `позиція ${idx} має description`);
        runner.assertTypeOf(pos.name, 'string', `позиція ${idx} name - string`);
      });
    });
  });
});

// === Витяг карт ===
runner.describe('tarot-engine: Витяг карт', () => {
  runner.test('drawSpread повертає правильну кількість карт', () => {
    runner.assertArrayLength(drawSpread(3), 3, 'drawSpread(3) повинен повернути 3');
    runner.assertArrayLength(drawSpread(5), 5, 'drawSpread(5) повинен повернути 5');
  });

  runner.test('карти в розкладі мають необхідні властивості', () => {
    const spread = drawSpread(3);
    spread.forEach((item, idx) => {
      runner.assertHasProperty(item, 'card', `карта ${idx} має card`);
      runner.assertHasProperty(item, 'position', `карта ${idx} має position`);
      runner.assertHasProperty(item, 'positionDescription', `карта ${idx} має positionDescription`);
      runner.assertHasProperty(item, 'reversed', `карта ${idx} має reversed`);
      runner.assertTypeOf(item.reversed, 'boolean', `карта ${idx} reversed - boolean`);
    });
  });

  runner.test('карти в розкладі унікальні', () => {
    const spread = drawSpread(10);
    const cardIds = spread.map((i) => i.card.id);
    const uniqueIds = new Set(cardIds);
    runner.assertEquals(uniqueIds.size, cardIds.length, 'усі карти мають бути унікальні');
  });

  runner.test('позиції відповідають означенню розкладу', () => {
    const spread = drawSpread(3, 'classic3');
    runner.assertEquals(spread[0].position, 'Минуле', 'позиція 0 - Минуле');
    runner.assertEquals(spread[1].position, 'Теперішнє', 'позиція 1 - Теперішнє');
    runner.assertEquals(spread[2].position, 'Майбутнє', 'позиція 2 - Майбутнє');
  });

  runner.test('drawSpread за типом повертає правильну кількість', () => {
    const pentagram = drawSpread(5, 'pentagram5');
    runner.assertArrayLength(pentagram, 5, 'pentagram5 має 5 карт');

    const love = drawSpread(5, 'love5');
    runner.assertArrayLength(love, 5, 'love5 має 5 карт');
  });

  runner.test('drawSpread обробляє граничні випадки', () => {
    // drawSpread(1) повертає default spread (classic3 - 3 карти)
    runner.assertArrayLength(drawSpread(1), 3, 'drawSpread(1) повертає default spread (3 карти)');
    // drawSpread(0) теж повертає default spread
    runner.assertArrayLength(drawSpread(0), 3, 'drawSpread(0) повертає default spread (3 карти)');
    // Великі числа повертають pentagram5 (5 карт)
    runner.assertArrayLength(drawSpread(100), 5, 'drawSpread(100) повертає pentagram5 (5 карт)');
  });
});

// === Карта дня ===
runner.describe('tarot-engine: Карта дня', () => {
  runner.test('getCardOfDay повертає об\'єкт карти', () => {
    const cardOfDay = getCardOfDay();
    runner.assertHasProperty(cardOfDay, 'card', 'має card');
    runner.assertHasProperty(cardOfDay, 'position', 'має position');
    runner.assertHasProperty(cardOfDay, 'positionDescription', 'має positionDescription');
    runner.assertHasProperty(cardOfDay, 'reversed', 'має reversed');
  });

  runner.test('позиція завжди "Карта дня"', () => {
    const cardOfDay = getCardOfDay();
    runner.assertEquals(cardOfDay.position, 'Карта дня', 'position має бути Карта дня');
  });

  runner.test('та сама дата повертає ту саму карту', () => {
    const date = new Date('2024-01-15');
    const card1 = getCardOfDay(date);
    const card2 = getCardOfDay(date);
    runner.assertEquals(card1.card.id, card2.card.id, 'та сама дата - та сама карта');
    runner.assertEquals(card1.reversed, card2.reversed, 'та сама дата - той самий reversed');
  });

  runner.test('reversed є boolean', () => {
    const cardOfDay = getCardOfDay();
    runner.assertTypeOf(cardOfDay.reversed, 'boolean', 'reversed має бути boolean');
  });

  runner.test('карта з TAROT_SEED', () => {
    const cardOfDay = getCardOfDay();
    const cardExists = TAROT_SEED.some((c) => c.id === cardOfDay.card.id);
    runner.assertTrue(cardExists, 'карта дня з TAROT_SEED');
  });
});

// === Інтерпретація ===
runner.describe('tarot-engine: Інтерпретація', () => {
  runner.test('generateInterpretation повертає об\'єкт інтерпретації', () => {
    const spread = drawSpread(3);
    const interp = generateInterpretation(spread, 'classic3');
    runner.assertHasProperty(interp, 'title', 'має title');
    runner.assertHasProperty(interp, 'tone', 'має tone');
    runner.assertHasProperty(interp, 'summary', 'має summary');
    runner.assertHasProperty(interp, 'energy', 'має energy');
    runner.assertHasProperty(interp, 'interactions', 'має interactions');
    runner.assertHasProperty(interp, 'advice', 'має advice');
    runner.assertHasProperty(interp, 'shadow', 'має shadow');
    runner.assertHasProperty(interp, 'nextStep', 'має nextStep');
    runner.assertHasProperty(interp, 'provider', 'має provider');
  });

  runner.test('інтерпретація tone за замовчуванням psychological', () => {
    const spread = drawSpread(3);
    const interp = generateInterpretation(spread);
    runner.assertEquals(interp.tone, 'psychological', 'tone - psychological');
  });

  runner.test('tone валідується', () => {
    const spread = drawSpread(3);
    const psych = generateInterpretation(spread, 'classic3', 'psychological');
    const mystic = generateInterpretation(spread, 'classic3', 'mystic');
    const pract = generateInterpretation(spread, 'classic3', 'practical');
    runner.assertTrue(
      ['psychological', 'mystic', 'practical'].includes(psych.tone),
      'psych tone валідний'
    );
    runner.assertTrue(['psychological', 'mystic', 'practical'].includes(mystic.tone), 'mystic tone валідний');
    runner.assertTrue(['psychological', 'mystic', 'practical'].includes(pract.tone), 'pract tone валідний');
  });

  runner.test('інтерпретація має масиви', () => {
    const spread = drawSpread(5);
    const interp = generateInterpretation(spread, 'pentagram5');
    runner.assertTrue(Array.isArray(interp.interactions), 'interactions - масив');
    runner.assertTrue(Array.isArray(interp.advice), 'advice - масив');
    runner.assertTrue(interp.advice.length > 0, 'advice має елементи');
  });

  runner.test('порожній розклад повертає placeholder', () => {
    const interp = generateInterpretation([]);
    runner.assertTrue(interp.summary.includes('розклад'), 'має слово розклад');
    runner.assertEquals(interp.provider, 'rule-based', 'provider - rule-based');
  });

  runner.test('інтерпретація включає значення карт', () => {
    const spread = drawSpread(3);
    const interp = generateInterpretation(spread, 'classic3');
    runner.assertTrue(interp.summary.length > 0, 'summary не пусто');
    runner.assertTrue(interp.energy.length > 0, 'energy не пусто');
  });

  runner.test('provider - rule-based', () => {
    const spread = drawSpread(3);
    const interp = generateInterpretation(spread, 'classic3');
    runner.assertEquals(interp.provider, 'rule-based', 'provider - rule-based');
  });
});

// === Стрес-тести ===
runner.describe('tarot-engine: Стрес-тести', () => {
  runner.test('кілька розкладів без помилок', () => {
    for (let i = 0; i < 10; i++) {
      const spread = drawSpread(5);
      runner.assertArrayLength(spread, 5, `розклад ${i} має 5 карт`);
    }
  });

  runner.test('інтерпретація генерується послідовно', () => {
    const spread = drawSpread(3);
    const interp1 = generateInterpretation(spread, 'classic3', 'psychological');
    const interp2 = generateInterpretation(spread, 'classic3', 'psychological');
    runner.assertEquals(interp1.title, interp2.title, 'той самий розклад - той самий title');
  });

  runner.test('все працює разом', () => {
    const cards = getCards();
    runner.assertArrayLength(cards, 78, 'getCards - 78');

    const spreads = getSpreadDefinitions();
    runner.assertArrayLength(spreads, 4, 'getSpreadDefinitions - 4');

    const drawn = drawSpread(3);
    runner.assertArrayLength(drawn, 3, 'drawSpread - 3');

    const cardDay = getCardOfDay();
    runner.assertHasProperty(cardDay, 'card', 'getCardOfDay - має card');

    const interp = generateInterpretation(drawn);
    runner.assertHasProperty(interp, 'summary', 'generateInterpretation - має summary');
  });
});

// Запуск тестів
runner.run();
