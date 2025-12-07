import { writable, derived } from 'svelte/store';

export const mood = writable('thoughtful'); // 'happy' | 'reflective' | 'motivational' | 'low' | 'thoughtful'

const MOOD_TOKEN_MAP = {
  happy: {
    accent: '34 197 94', // emerald-500
    accent2: '59 130 246', // blue-500
    bgFrom: '245 247 252', // light gray-blue
    bgTo: '228 241 233', // soft green tint
    borderGlow: '16 185 129',
    typeScale: '1.0',
    animationSpeed: '1.0'
  },
  reflective: {
    accent: '168 85 247', // violet-500
    accent2: '14 165 233', // sky-500
    bgFrom: '248 244 255', // lavender tint
    bgTo: '233 244 255', // pale blue
    borderGlow: '168 85 247',
    typeScale: '1.02',
    animationSpeed: '0.9'
  },
  motivational: {
    accent: '20 184 166', // teal
    accent2: '251 191 36', // amber-400
    bgFrom: '248 250 252', // slate-50
    bgTo: '236 254 255', // sky-50/teal tint
    borderGlow: '20 184 166',
    typeScale: '1.0',
    animationSpeed: '1.05'
  },
  low: {
    accent: '59 130 246', // blue
    accent2: '52 211 153', // green-400
    bgFrom: '243 244 246', // gray-100
    bgTo: '232 234 238', // cool gray
    borderGlow: '59 130 246',
    typeScale: '0.98',
    animationSpeed: '0.85'
  },
  thoughtful: {
    accent: '99 102 241', // indigo-500
    accent2: '20 184 166', // teal-500
    bgFrom: '247 248 252', // soft paper
    bgTo: '234 239 248', // subtle blue-gray
    borderGlow: '99 102 241',
    typeScale: '1.0',
    animationSpeed: '0.95'
  }
};

export const moodTokens = derived(mood, ($mood) => {
  const fallback = MOOD_TOKEN_MAP.thoughtful;
  return MOOD_TOKEN_MAP[$mood] || fallback;
});


