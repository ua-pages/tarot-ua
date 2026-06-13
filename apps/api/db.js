const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const DATA_DIR = resolve(__dirname, 'data');
const SHARED_FILE = resolve(DATA_DIR, 'shared-spreads.json');

function zabezpechytyKataloh() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function chytatySpilnyi() {
  zabezpechytyKataloh();
  if (!existsSync(SHARED_FILE)) return [];
  try {
    const raw = readFileSync(SHARED_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function zapysatySpilnyi(spreads) {
  zabezpechytyKataloh();
  writeFileSync(SHARED_FILE, JSON.stringify(spreads, null, 2), 'utf8');
}

module.exports = { chytatySpilnyi, zapysatySpilnyi };
