/**
 * テキストから記号を除去し、小文字化・余分な空白を除去する
 * 
 * @param {string} str - 入力テキスト
 * @returns {string} 正規化されたテキスト
 */
export function normalizeText(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

/**
 * ユーザーの発話テキストとお手本テキストの単語一致率（0〜100%）を計算する
 * 
 * @param {string} userText - ユーザーの発話テキスト
 * @param {string} targetAnswer - 正解テキスト
 * @param {string[]} [acceptedAnswers=[]] - 許容される別解リスト
 * @returns {number} 一致率パーセンテージ (0〜100)
 */
export function calculateTextMatchScore(userText, targetAnswer, acceptedAnswers = []) {
  if (!userText) return 0;

  const userNorm = normalizeText(userText);
  if (!userNorm) return 0;

  const targets = [targetAnswer, ...(acceptedAnswers || [])].map(normalizeText).filter(Boolean);
  if (targets.length === 0) return 0;

  let maxScore = 0;

  for (const target of targets) {
    if (userNorm === target) return 100;

    const targetWords = target.split(/\s+/).filter(Boolean);
    const userWords = userNorm.split(/\s+/).filter(Boolean);

    if (targetWords.length === 0) continue;

    let matchedCount = 0;
    const targetWordsCopy = [...targetWords];

    for (const uWord of userWords) {
      const foundIdx = targetWordsCopy.indexOf(uWord);
      if (foundIdx !== -1) {
        matchedCount++;
        targetWordsCopy.splice(foundIdx, 1);
      }
    }

    const score = Math.round((matchedCount / targetWords.length) * 100);
    if (score > maxScore) {
      maxScore = score;
    }
  }

  return Math.min(100, maxScore);
}
