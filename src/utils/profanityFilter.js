import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers
} from 'obscenity';

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor();

/**
 * Checks if a string contains profanity
 * @param {string} text - The text to check
 * @returns {boolean} - True if profanity is found
 */
export const hasProfanity = (text) => {
  if (!text || typeof text !== 'string') return false;
  return matcher.hasMatch(text);
};

/**
 * Censors profanity in a string
 * @param {string} text - The text to censor
 * @returns {string} - The censored text
 */
export const censorProfanity = (text) => {
  if (!text || typeof text !== 'string') return text;
  const matches = matcher.getAllMatches(text);
  return censor.applyTo(text, matches);
};
