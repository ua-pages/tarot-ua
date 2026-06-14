export function getCardMeaning(card) {
  return card.reversed ? card.card.meaningReversed : card.card.meaningUpright;
}

export function pluralizeCard(count) {
  if (count === 1) return 'карта';
  if (count >= 2 && count <= 4) return 'карти';
  return 'карт';
}

export function formatCardCount(count) {
  return `${count} ${pluralizeCard(count)}`;
}

export function formatDate(date, options) {
  return new Intl.DateTimeFormat('uk-UA', options ?? { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export function groupEntriesByMonth(items) {
  const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
  const groups = new Map();

  items.forEach((item) => {
    const month = formatter.format(new Date(item.createdAt));
    groups.set(month, [...(groups.get(month) ?? []), item]);
  });

  return Array.from(groups.entries()).map(([month, groupItems]) => ({ month, items: groupItems }));
}

export function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function getTodayTag() {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'full' }).format(new Date());
}
