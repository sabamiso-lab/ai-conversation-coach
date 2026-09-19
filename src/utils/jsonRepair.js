/**
 * Utility functions for repairing and cleaning JSON responses from AI models (e.g. Gemini)
 */

/**
 * Fix unescaped control characters (like raw linebreaks) inside JSON strings
 */
export function sanitizeControlChars(str) {
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (isEscaped) {
        result += ch;
        isEscaped = false;
      } else if (ch === '\\') {
        result += ch;
        isEscaped = true;
      } else if (ch === '"') {
        result += ch;
        inString = false;
      } else if (ch === '\n') {
        result += '\\n';
      } else if (ch === '\r') {
        result += '\\r';
      } else if (ch === '\t') {
        result += '\\t';
      } else {
        result += ch;
      }
    } else {
      if (ch === '"') {
        inString = true;
      }
      result += ch;
    }
  }
  return result;
}

/**
 * Auto-close unclosed string literals, array brackets `]`, and object braces `}`
 */
export function autoCloseJson(str) {
  let inString = false;
  let isEscaped = false;
  const stack = [];

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (ch === '\\') {
        isEscaped = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === '{' || ch === '[') {
        stack.push(ch);
      } else if (ch === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  let repaired = str;

  // 1. If inside an unclosed string, close the string quote
  if (inString) {
    if (isEscaped) {
      repaired = repaired.slice(0, -1);
    }
    repaired += '"';
  }

  // 2. Remove trailing commas before closing brackets/braces
  repaired = repaired.replace(/,\s*$/, '');

  // 3. Close open brackets/braces in reverse order
  while (stack.length > 0) {
    const opening = stack.pop();
    if (opening === '{') {
      repaired += '}';
    } else if (opening === '[') {
      repaired += ']';
    }
  }

  return repaired;
}

/**
 * Truncate repetitive phrase loops in AI-generated text
 */
export function truncateRepetitiveLoops(text) {
  if (!text || typeof text !== 'string') return text;

  // 1. Detect exact phrase pattern repeating 2+ times
  const patternRegex = /(.{3,80}?)\1{2,}/su;
  const match = text.match(patternRegex);
  if (match) {
    const repeatPattern = match[1];
    const firstIdx = text.indexOf(repeatPattern);
    const secondIdx = text.indexOf(repeatPattern, firstIdx + repeatPattern.length);
    if (secondIdx !== -1) {
      return text.slice(0, secondIdx + repeatPattern.length).trim();
    }
  }

  // 2. Detect excessive consecutive praise words
  const praiseWordsRegex = /(?:素晴らしい|グッジョブ|お見事|バッチリ|最高|ナイス|ハッピー|イエス|素敵|すてき|すごい|ファイト|よくできました|おめでとう|やったね)[！!]/g;
  const praiseMatches = text.match(praiseWordsRegex);
  if (praiseMatches && praiseMatches.length >= 4) {
    let count = 0;
    let cutIndex = -1;
    let m;
    const searchRegex = /(?:素晴らしい|グッジョブ|お見事|バッチリ|最高|ナイス|ハッピー|イエス|素敵|すてき|すごい|ファイト|よくできました|おめでとう|やったね)[！!]/g;
    while ((m = searchRegex.exec(text)) !== null) {
      count++;
      if (count === 3) {
        cutIndex = m.index + m[0].length;
        break;
      }
    }
    if (cutIndex !== -1 && cutIndex < text.length) {
      return text.slice(0, cutIndex).trim();
    }
  }

  // 3. Cap text at 250 chars as fallback protection
  if (text.length > 250) {
    const truncated = text.slice(0, 250);
    const lastPunct = Math.max(
      truncated.lastIndexOf('！'),
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );
    if (lastPunct > 50) {
      return truncated.slice(0, lastPunct + 1);
    }
    return truncated + '...';
  }

  return text;
}

/**
 * Clean and format individual English phrase suggestions
 */
export function cleanPhrase(text) {
  if (!text || typeof text !== 'string') return null;

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^["'“`]+|["'”`]+$/g, '').trim();
  cleaned = cleaned.replace(/^(?:\d+\.\s*|you can say:\s*|option:\s*|phrase:\s*)/i, '').trim();
  cleaned = cleaned.replace(/^["'“`]+|["'”`]+$/g, '').trim();

  if (!cleaned) return null;

  cleaned = truncateRepetitiveLoops(cleaned);

  if (cleaned.length > 150) {
    cleaned = cleaned.slice(0, 150).trim();
  }

  return cleaned;
}

/**
 * Clean raw text response from API and safely parse JSON with repair fallback
 */
export function repairJson(rawJson) {
  if (!rawJson) throw new Error("Empty response from API");

  let cleaned = rawJson.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // Attempt 1: Direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // Attempt 2: Sanitize control characters
    try {
      const sanitized = sanitizeControlChars(cleaned);
      return JSON.parse(sanitized);
    } catch {
      // Attempt 3: Auto-close truncated JSON
      try {
        const autoClosed = autoCloseJson(cleaned);
        return JSON.parse(autoClosed);
      } catch {
        // Attempt 4: Combination of sanitize + auto-close
        try {
          const combined = autoCloseJson(sanitizeControlChars(cleaned));
          return JSON.parse(combined);
        } catch {
          throw e1;
        }
      }
    }
  }
}

/**
 * Clean and parse JSON, throwing a user-friendly error on failure
 */
export function cleanAndParseJson(rawJson) {
  if (!rawJson) throw new Error("Empty response from API");

  try {
    return repairJson(rawJson);
  } catch (err) {
    console.error("JSON Parse Error. Raw string length:", rawJson.length, "Raw string snippet:", rawJson.slice(0, 300));
    throw new Error(`JSON parsing failed: ${err.message}. The response may have been cut off or formatted incorrectly.`);
  }
}
