import {
  otrymatyVsiZapysy,
  dodatyZapysDoZhumalu,
  onovytyZapysUZhumali,
  vydalytyZapysIZhumalu,
  otrymatyObraniZapysy,
  mihruvatyZLocalStorage,
} from './indexed-db.js';

let initialized = false;

async function ensureInit() {
  if (initialized) return;
  initialized = true;
  await mihruvatyZLocalStorage();
}

export async function zavantazhytyZhurnal() {
  await ensureInit();
  return otrymatyVsiZapysy();
}

export async function dodatyZapys(entry) {
  await ensureInit();
  return dodatyZapysDoZhumalu({
    title: entry.title,
    spreadType: entry.spreadType,
    cards: entry.cards,
    interpretation: entry.interpretation || null,
    favorite: entry.favorite || false,
    note: entry.note || '',
  });
}

export async function onovytyZapys(id, updates) {
  await ensureInit();
  return onovytyZapysUZhumali(id, updates);
}

export async function vydalytyZapys(id) {
  await ensureInit();
  return vydalytyZapysIZhumalu(id);
}

export async function zavantazhytyObrane() {
  await ensureInit();
  return otrymatyObraniZapysy();
}
