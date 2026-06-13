const PREFIX = 'tarot-fast:';

export function zberehtySesiia(key, data) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {}
}

export function zavantazhytySesiia(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function vydalytySesiia(key) {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {}
}

export function ochystytySesiia() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

export function zberehtyRozkładSesiia(data) {
  zberehtySesiia('spread', data);
}

export function zavantazhytyRozkładSesiia() {
  return zavantazhytySesiia('spread');
}

export function zberehtyInterpretatsiiaSesiia(data) {
  zberehtySesiia('interpretation', data);
}

export function zavantazhytyInterpretatsiiaSesiia() {
  return zavantazhytySesiia('interpretation');
}

export function zberehtyNikneym(name) {
  zberehtySesiia('nickname', name);
}

export function zavantazhytyNikneym() {
  return zavantazhytySesiia('nickname');
}
