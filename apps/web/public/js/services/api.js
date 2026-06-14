import { getCards, getSpreadDefinitions, drawSpread, getCardOfDay, generateInterpretation } from './tarot-engine.js';
import { zberehtySpilnyiRozkład, otrymatySpilnyiRozkład } from './indexed-db.js';

export function zavantazhytyKarta(kilkist = 78) {
  return Promise.resolve(getCards(kilkist));
}

export function zavantazhytyRozkładVyznachennia() {
  return Promise.resolve(getSpreadDefinitions());
}

export function namaliuvatyRozkład(kilkist = 3, type) {
  return Promise.resolve(drawSpread(kilkist, type));
}

export function zavantazhytyKartaDen(date) {
  return Promise.resolve(getCardOfDay(date ? new Date(date) : new Date()));
}

export function zavantazhytyRozkładInterpretatsiia(spread, type, tone = 'psychological') {
  return Promise.resolve(generateInterpretation(spread, type, tone));
}

function stvorytySluh() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 10; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

export async function stvorytyDostupnyiRozkład(input) {
  const slug = stvorytySluh();
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
  await zberehtySpilnyiRozkład(shared);
  return shared;
}

export async function zavantazhytySpilnyiRozkład(slug) {
  const shared = await otrymatySpilnyiRozkład(slug);
  if (!shared) throw new Error('Розклад не знайдено');
  return shared;
}
