export function kartaZnachennia(card) {
  return card.reversed ? card.card.meaningReversed : card.card.meaningUpright;
}

export function mnozhynatyKarta(kilkist) {
  if (kilkist === 1) return 'карта';
  if (kilkist >= 2 && kilkist <= 4) return 'карти';
  return 'карт';
}

export function formatuvatyKartaKilkist(kilkist) {
  return `${kilkist} ${mnozhynatyKarta(kilkist)}`;
}

export function formatuvatyData(date, options) {
  return new Intl.DateTimeFormat('uk-UA', options ?? { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export function hrupaElementyPoMisats(items) {
  const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
  const groups = new Map();

  items.forEach((item) => {
    const month = formatter.format(new Date(item.createdAt));
    groups.set(month, [...(groups.get(month) ?? []), item]);
  });

  return Array.from(groups.entries()).map(([month, groupItems]) => ({ month, items: groupItems }));
}

export function zatrymty(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function otymatySohodniMitka() {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'full' }).format(new Date());
}
