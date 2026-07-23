const STORAGE_PREFIX = 'tarot-ua:daily-reflection:';

export function getReflectionQuestion(cardOfDay) {
  const keyword = cardOfDay?.card?.keywords?.[0] || 'цей образ';

  if (cardOfDay?.reversed) {
    return `Що заважає вам чесно подивитися на тему «${keyword}»?`;
  }

  return `Де сьогодні варто дати більше простору темі «${keyword}»?`;
}

export function reflectionKey(date = new Date()) {
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  return `${STORAGE_PREFIX}${day}`;
}

export function loadReflection(storage, date = new Date()) {
  try {
    return storage.getItem(reflectionKey(date)) || '';
  } catch {
    return '';
  }
}

export function saveReflection(storage, note, date = new Date()) {
  const value = note.trim();

  try {
    if (value) storage.setItem(reflectionKey(date), value);
    else storage.removeItem(reflectionKey(date));
    return true;
  } catch {
    return false;
  }
}
