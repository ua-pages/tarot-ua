import {
  getAllEntries,
  addEntryToJournal,
  updateEntryInJournal,
  deleteEntryFromJournal,
  getFavoriteEntries,
  migrateFromLocalStorage,
} from './indexed-db.js';

let initialized = false;

async function ensureInit() {
  if (initialized) return;
  initialized = true;
  await migrateFromLocalStorage();
}

export async function loadJournal() {
  await ensureInit();
  return getAllEntries();
}

export async function addEntry(entry) {
  await ensureInit();
  return addEntryToJournal({
    title: entry.title,
    spreadType: entry.spreadType,
    cards: entry.cards,
    interpretation: entry.interpretation || null,
    favorite: entry.favorite || false,
    note: entry.note || '',
  });
}

export async function updateEntry(id, updates) {
  await ensureInit();
  return updateEntryInJournal(id, updates);
}

export async function deleteEntry(id) {
  await ensureInit();
  return deleteEntryFromJournal(id);
}

export async function loadFavorites() {
  await ensureInit();
  return getFavoriteEntries();
}
