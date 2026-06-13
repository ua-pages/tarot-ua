const baseHeaders = { 'Content-Type': 'application/json' };

async function rozibratyJson(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export async function stvorytyDostupnyiRozkład(input) {
  return rozibratyJson(await fetch('/api/share/spreads', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(input)
  }), 'Не вдалося створити публічне посилання');
}

export async function zavantazhytySpilnyiRozkład(slug) {
  return rozibratyJson(await fetch(`/api/share/spreads/${encodeURIComponent(slug)}`, {
    headers: baseHeaders
  }), 'Публічний розклад не знайдено');
}

export async function zavantazhytyKarta(kilkist = 78) {
  return rozibratyJson(await fetch(`/api/tarot/cards?count=${kilkist}`, { headers: baseHeaders }), 'Не вдалося завантажити карти');
}

export async function zavantazhytyRozkładVyznachennia() {
  return rozibratyJson(await fetch('/api/tarot/spreads', { headers: baseHeaders }), 'Не вдалося завантажити типи розкладів');
}

export async function namaliuvatyRozkład(kilkist = 3, type) {
  const params = new URLSearchParams({ count: String(kilkist) });
  if (type) params.set('type', type);
  return rozibratyJson(await fetch(`/api/tarot/draw?${params.toString()}`, { headers: baseHeaders }), 'Не вдалося зробити розклад');
}

export async function zavantazhytyKartaDen(date) {
  const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
  return rozibratyJson(await fetch(`/api/tarot/card-of-day${suffix}`, { headers: baseHeaders }), 'Не вдалося отримати карту дня');
}

export async function zavantazhytyRozkładInterpretatsiia(spread, type, tone = 'psychological') {
  return rozibratyJson(await fetch('/api/tarot/interpretation', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ spread, type, tone })
  }), 'Не вдалося згенерувати ШІ-тлумачення');
}
