import { getCards, getSpreadDefinitions, drawSpread, getCardOfDay, generateInterpretation } from './tarot-engine.js';
import { saveSharedSpread, getSharedSpread } from './indexed-db.js';

export function fetchCards(count = 78) {
  return Promise.resolve(getCards(count));
}

export function fetchSpreadDefinitions() {
  return Promise.resolve(getSpreadDefinitions());
}

export function drawSpreadCards(count = 3, type) {
  return Promise.resolve(drawSpread(count, type));
}

export function fetchCardOfDay(date) {
  return Promise.resolve(getCardOfDay(date ? new Date(date) : new Date()));
}

export function fetchSpreadInterpretation(spread, type, tone = 'psychological') {
  return Promise.resolve(generateInterpretation(spread, type, tone));
}

function makeSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 10; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

export async function createShareableSpread(input) {
  const slug = makeSlug();
  const shared = {
    slug,
    title: input.title,
    spreadType: input.spreadType,
    cards: input.cards,
    interpretation: input.interpretation || null,
    createdAt: new Date().toISOString(),
    url: `${window.location.origin}/share/${slug}`,
    path: `/share/${slug}`,
    social: {
      title: input.title,
      description: input.interpretation?.summary || 'Розклад Таро',
      imageUrl: '',
    },
  };
  await saveSharedSpread(shared);
  return shared;
}

export async function fetchSharedSpread(slug) {
  const shared = await getSharedSpread(slug);
  if (!shared) throw new Error('Розклад не знайдено');
  return shared;
}
