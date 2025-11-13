import { writable, derived } from 'svelte/store';

export const mood = writable('thoughtful'); // 'happy' | 'reflective' | 'motivational' | 'low' | 'thoughtful'

const MOOD_TOKEN_MAP = {
  happy: {
    accent: '180 75 60', // teal-ish
    accent2: '50 180 90', // green accent
    bgFrom: '18 24 38', // slate-900-ish
    bgTo: '6 95 70', // emerald-700-ish
    borderGlow: '16 185 129',
    typeScale: '1.0',
    animationSpeed: '1.0'
  },
  reflective: {
    accent: '147 112 219', // lavender
    accent2: '91 76 175', // dusty purple
    bgFrom: '9 9 14', // near black
    bgTo: '36 24 54', // deep purple
    borderGlow: '147 112 219',
    typeScale: '1.02',
    animationSpeed: '0.9'
  },
  motivational: {
    accent: '20 184 166', // teal
    accent2: '234 179 8', // gold
    bgFrom: '10 12 20',
    bgTo: '5 150 105',
    borderGlow: '20 184 166',
    typeScale: '1.0',
    animationSpeed: '1.05'
  },
  low: {
    accent: '30 58 138', // deep navy
    accent2: '21 128 61', // forest green
    bgFrom: '2 6 23', // slate-950
    bgTo: '15 23 42', // slate-900
    borderGlow: '30 58 138',
    typeScale: '0.98',
    animationSpeed: '0.85'
  },
  thoughtful: {
    accent: '99 102 241', // indigo-500
    accent2: '16 185 129', // emerald-500
    bgFrom: '2 6 23', // slate-950
    bgTo: '30 41 59', // slate-800
    borderGlow: '99 102 241',
    typeScale: '1.0',
    animationSpeed: '0.95'
  }
};

export const moodTokens = derived(mood, ($mood) => {
  const fallback = MOOD_TOKEN_MAP.thoughtful;
  return MOOD_TOKEN_MAP[$mood] || fallback;
});


