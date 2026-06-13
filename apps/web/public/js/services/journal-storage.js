const STORAGE_KEY = 'tarot-journal';
const MAX_ENTRIES = 50;

export function zavantazhytyZhurnal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function zberehtyZhurnal(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function dodatyZapys(entry) {
  const entries = zavantazhytyZhurnal();
  const newEntry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: entry.title,
    spreadType: entry.spreadType,
    cards: entry.cards,
    interpretation: entry.interpretation || null,
    favorite: entry.favorite || false,
    note: entry.note || '',
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  zberehtyZhurnal(entries.slice(0, MAX_ENTRIES));
  return newEntry;
}

export function onovytyZapys(id, updates) {
  const entries = zavantazhytyZhurnal();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  entries[index] = { ...entries[index], ...updates };
  zberehtyZhurnal(entries);
  return entries[index];
}

export function vydalytyZapys(id) {
  const entries = zavantazhytyZhurnal().filter((e) => e.id !== id);
  zberehtyZhurnal(entries);
}

export function zavantazhytyObrane() {
  return zavantazhytyZhurnal().filter((e) => e.favorite);
}
