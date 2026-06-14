const DB_NAME = 'tarot-ua';
const DB_VERSION = 1;

let db = null;

function vidkrytyBD() {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains('journal')) {
        const store = database.createObjectStore('journal', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('favorite', 'favorite', { unique: false });
      }

      if (!database.objectStoreNames.contains('shared-spreads')) {
        database.createObjectStore('shared-spreads', { keyPath: 'slug' });
      }

      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

function vykonatyTransaktsiiu(storeName, mode, callback) {
  return vidkrytyBD().then((database) => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      callback(store, resolve, reject);
      transaction.onerror = () => reject(transaction.error);
    });
  });
}

// Журнал (щоденник)

export function otrymatyVsiZapysy() {
  return vykonatyTransaktsiiu('journal', 'readonly', (store, resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const entries = req.result || [];
      entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(entries);
    };
    req.onerror = () => reject(req.error);
  });
}

export function dodatyZapysDoZhumalu(entry) {
  return vykonatyTransaktsiiu('journal', 'readwrite', (store, resolve, reject) => {
    const newEntry = {
      id: crypto.randomUUID(),
      ...entry,
      createdAt: entry.createdAt || new Date().toISOString(),
    };
    const req = store.add(newEntry);
    req.onsuccess = () => resolve(newEntry);
    req.onerror = () => reject(req.error);
  });
}

export function onovytyZapysUZhumali(id, updates) {
  return vykonatyTransaktsiiu('journal', 'readwrite', (store, resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) {
        resolve(null);
        return;
      }
      const updated = { ...existing, ...updates };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve(updated);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export function vydalytyZapysIZhumalu(id) {
  return vykonatyTransaktsiiu('journal', 'readwrite', (store, resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function otrymatyObraniZapysy() {
  return vykonatyTransaktsiiu('journal', 'readonly', (store, resolve, reject) => {
    const index = store.index('favorite');
    const req = index.getAll(true);
    req.onsuccess = () => {
      const entries = req.result || [];
      entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(entries);
    };
    req.onerror = () => reject(req.error);
  });
}

// Спільні розклади (локальний шеринг)

export function zberehtySpilnyiRozkład(spread) {
  return vykonatyTransaktsiiu('shared-spreads', 'readwrite', (store, resolve, reject) => {
    const req = store.add(spread);
    req.onsuccess = () => resolve(spread);
    req.onerror = () => reject(req.error);
  });
}

export function otrymatySpilnyiRozkład(slug) {
  return vykonatyTransaktsiiu('shared-spreads', 'readonly', (store, resolve, reject) => {
    const req = store.get(slug);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// Налаштування

export function zberehtyNalashtuvannia(key, value) {
  return vykonatyTransaktsiiu('settings', 'readwrite', (store, resolve, reject) => {
    const req = store.put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function otrymatyNalashtuvannia(key) {
  return vykonatyTransaktsiiu('settings', 'readonly', (store, resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

// Міграція з localStorage

export function mihruvatyZLocalStorage() {
  return vykonatyTransaktsiiu('journal', 'readonly', (store, resolve, reject) => {
    const countReq = store.count();
    countReq.onsuccess = () => resolve(countReq.result === 0);
    countReq.onerror = () => reject(countReq.error);
  }).then((empty) => {
    if (!empty) return false;
    const raw = localStorage.getItem('tarot-journal');
    if (!raw) return false;
    let entries;
    try { entries = JSON.parse(raw); }
    catch { return false; }
    if (!Array.isArray(entries) || !entries.length) return false;
    return vykonatyTransaktsiiu('journal', 'readwrite', (store, resolve, reject) => {
      const maxEntries = 200;
      const toMigrate = entries.slice(0, maxEntries);
      let completed = 0;
      for (const entry of toMigrate) {
        const req = store.put(entry);
        req.onsuccess = () => {
          completed++;
          if (completed === toMigrate.length) resolve(true);
        };
        req.onerror = () => reject(req.error);
      }
      if (toMigrate.length === 0) resolve(false);
    });
  });
}
