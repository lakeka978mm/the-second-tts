import { SentenceToken, WordToken } from '../types';

/**
 * Splits text into sentences and then into words, preserving offsets.
 * This is crucial for the "Click-to-Play" functionality.
 */
export const tokenizeText = (text: string): SentenceToken[] => {
  if (!text) return [];

  // Simple sentence splitting logic. 
  // In a production app, use 'intl-segmenter-polyfill' or similar for better locale support.
  // This regex splits by punctuation (. ! ?) followed by whitespace or end of string.
  const sentenceRegex = /[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g;
  
  const sentences: SentenceToken[] = [];
  let match;

  let sentenceIdCounter = 0;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentenceText = match[0];
    const sentenceStart = match.index;
    const sentenceEnd = sentenceStart + sentenceText.length;

    // Tokenize words within the sentence
    const words: WordToken[] = [];
    const wordRegex = /\S+/g; // Match non-whitespace sequences
    let wordMatch;
    let wordIndexInSentence = 0;

    while ((wordMatch = wordRegex.exec(sentenceText)) !== null) {
      words.push({
        text: wordMatch[0],
        start: sentenceStart + wordMatch.index, // Absolute offset
        end: sentenceStart + wordMatch.index + wordMatch[0].length,
        indexInSentence: wordIndexInSentence,
      });
      wordIndexInSentence++;
    }

    sentences.push({
      id: `s-${sentenceIdCounter++}`,
      text: sentenceText,
      start: sentenceStart,
      end: sentenceEnd,
      words: words,
    });
  }

  return sentences;
};