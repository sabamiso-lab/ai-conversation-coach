/**
 * Speech Transcript Processing Utilities
 * Provides functions to clean up and merge speech recognition transcripts,
 * preventing duplicate words and phrases caused by Web Speech API quirks.
 */

/**
 * Normalizes a word by trimming surrounding punctuation and converting to lowercase.
 */
export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
}

/**
 * Removes immediately repeated words within a transcript string
 * (e.g., "hello hello" -> "hello", "apple apple" -> "apple").
 */
export function deduplicateConsecutiveWords(text: string): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return text.trim();

  const result: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const prev = result[result.length - 1];

    if (!prev) {
      result.push(current);
      continue;
    }

    const normCurrent = normalizeWord(current);
    const normPrev = normalizeWord(prev);

    // If normalized words are identical and non-empty, skip duplicate
    if (normCurrent && normCurrent === normPrev) {
      // Keep the one with punctuation if any
      if (current.length > prev.length && /[.,!?;:]/.test(current)) {
        result[result.length - 1] = current;
      }
      continue;
    }

    result.push(current);
  }

  return result.join(' ');
}

/**
 * Cleans up speech transcript by normalizing whitespace and removing consecutive duplicate words.
 */
export function cleanTranscript(text: string): string {
  if (!text) return '';
  const normalizedSpaces = text.trim().replace(/\s+/g, ' ');
  return deduplicateConsecutiveWords(normalizedSpaces);
}

/**
 * Merges two transcript strings (e.g., final + interim, chunk[i] + chunk[i+1], base input + speech result)
 * by detecting and eliminating word-level overlaps at boundaries and avoiding duplicate text.
 */
export function mergeTranscripts(base: string, addition: string): string {
  const cleanBase = cleanTranscript(base);
  const cleanAddition = cleanTranscript(addition);

  if (!cleanBase) return cleanAddition;
  if (!cleanAddition) return cleanBase;

  const baseWords = cleanBase.split(/\s+/);
  const additionWords = cleanAddition.split(/\s+/);

  const normBaseWords = baseWords.map(normalizeWord);
  const normAdditionWords = additionWords.map(normalizeWord);

  const baseNorm = normBaseWords.join(' ');
  const additionNorm = normAdditionWords.join(' ');

  // Exact match (ignoring case & punctuation)
  if (baseNorm === additionNorm) {
    return cleanBase.length >= cleanAddition.length ? cleanBase : cleanAddition;
  }

  // Base is a complete prefix of addition (e.g., "Hello" + "hello world" -> "Hello world", "Hello" + "Hello, nice to meet you" -> "Hello, nice to meet you")
  if (additionNorm.startsWith(baseNorm + ' ')) {
    const remaining = additionWords.slice(baseWords.length);
    const matchedAdditionPrefix = additionWords.slice(0, baseWords.length).map((word, idx) => {
      const baseWord = baseWords[idx];
      if (baseWord && baseWord[0] === baseWord[0].toUpperCase() && word[0] === word[0].toLowerCase()) {
        return word[0].toUpperCase() + word.slice(1);
      }
      return word;
    });
    return matchedAdditionPrefix.concat(remaining).join(' ');
  }

  // Addition is completely subsumed at the end of base (e.g., "Hello world" + "world" -> "Hello world")
  if (baseNorm.endsWith(' ' + additionNorm)) {
    return cleanBase;
  }

  // Find longest overlap between the end of base and the start of addition
  const maxOverlap = Math.min(baseWords.length, additionWords.length);
  for (let k = maxOverlap; k >= 1; k--) {
    const baseSlice = normBaseWords.slice(baseWords.length - k).join(' ');
    const additionSlice = normAdditionWords.slice(0, k).join(' ');

    if (baseSlice && baseSlice === additionSlice) {
      const remaining = additionWords.slice(k);
      if (remaining.length === 0) {
        return cleanBase;
      }
      return baseWords.concat(remaining).join(' ');
    }
  }

  // No overlap found, join with space
  return `${cleanBase} ${cleanAddition}`;
}
