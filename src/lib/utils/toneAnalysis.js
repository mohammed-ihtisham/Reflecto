/**
 * Analyzes the tone of a message to determine typing speed for assistant
 * @param {string} message - The message to analyze
 * @returns {number} - Typing speed multiplier (0.5 = slow/thoughtful, 1 = normal, 1.5 = fast/energetic)
 */
export function analyzeTone(message) {
  if (!message || typeof message !== 'string') {
    return 1; // Default speed
  }

  const text = message.toLowerCase();
  
  // Slow/thoughtful indicators
  const slowIndicators = [
    'take a slow breath',
    'pause',
    'reflect',
    'consider',
    'think about',
    'remember',
    'understand',
    'meaningful',
    'deep',
    'contemplate',
    'meditate',
    'mindful',
    'gentle',
    'calm',
    'peaceful',
    '...',
    '✨',
    '💭'
  ];
  
  // Fast/energetic indicators
  const fastIndicators = [
    'excited',
    'amazing',
    'wonderful',
    'fantastic',
    'great',
    'awesome',
    '!',
    '🎉',
    '🚀',
    '💫',
    '🔥'
  ];
  
  // Count matches
  const slowCount = slowIndicators.filter(indicator => text.includes(indicator)).length;
  const fastCount = fastIndicators.filter(indicator => text.includes(indicator)).length;
  
  // Check for punctuation patterns
  const hasMultipleExclamation = (text.match(/!/g) || []).length > 1;
  const hasMultipleEllipsis = (text.match(/\.\.\./g) || []).length > 0;
  const hasQuestionMarks = (text.match(/\?/g) || []).length > 0;
  
  // Determine speed
  if (slowCount > fastCount || hasMultipleEllipsis || (hasQuestionMarks && slowCount > 0)) {
    return 0.6; // Slow, thoughtful
  } else if (fastCount > slowCount || hasMultipleExclamation) {
    return 1.5; // Fast, energetic
  } else if (text.length < 50) {
    return 1.2; // Short messages are slightly faster
  } else if (text.length > 200) {
    return 0.8; // Long messages are slightly slower
  }
  
  return 1; // Default normal speed
}

