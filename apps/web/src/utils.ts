import type { CloudSpread, DrawnCard } from './types';

export function cardMeaning(card: DrawnCard): string {
  return card.reversed ? card.card.meaningReversed : card.card.meaningUpright;
}

export function pluralizeCards(count: number): string {
  if (count === 1) return 'карта';
  if (count >= 2 && count <= 4) return 'карти';
  return 'карт';
}

export function formatCardsCount(count: number): string {
  return `${count} ${pluralizeCards(count)}`;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('uk-UA', options ?? { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export function groupItemsByMonth(items: CloudSpread[]) {
  const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
  const groups = new Map<string, CloudSpread[]>();

  items.forEach((item) => {
    const month = formatter.format(new Date(item.createdAt));
    groups.set(month, [...(groups.get(month) ?? []), item]);
  });

  return Array.from(groups.entries()).map(([month, groupItems]) => ({ month, items: groupItems }));
}
