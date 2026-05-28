import type { InterpretationTone } from '../types';

export const TONE_LABELS: Record<InterpretationTone, string> = {
  psychological: 'Психологічно',
  mystic: 'Містично',
  practical: 'Практично',
};

export const INTERPRETATION_TONES: Array<{ value: InterpretationTone; label: string }> = [
  { value: 'psychological', label: 'Психологічно' },
  { value: 'mystic', label: 'Містично' },
  { value: 'practical', label: 'Практично' },
];
