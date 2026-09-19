import { callGeminiApi } from './client';
import { cleanAndParseJson } from '../../utils/jsonRepair';

/**
 * Generate custom shadowing script via Gemini AI based on user topic & difficulty
 */
export async function generateShadowingScript({ apiKey, model, topic, difficulty = 'Intermediate' }) {
  if (!apiKey) throw new Error("Gemini APIキーを設定してください。");

  const isRandomRequest = !topic || !topic.trim() || topic.trim() === 'おまかせ' || topic.trim() === 'ランダム';
  const topicInstruction = isRandomRequest
    ? 'Select a practical, interesting, real-world English conversation scenario randomly by yourself (e.g. daily life, travel hassle, workplace presentation, or social chat).'
    : topic.trim();

  const systemPrompt = `
You are an expert English Speech Coach creating an optimal Shadowing Practice Script for English learners.
Topic/Interest: ${topicInstruction}
Target Difficulty: ${difficulty}

DIFFICULTY LEVEL GUIDELINES:
- Beginner: Short sentences (2-3 short clauses, 15-25 words), simple A1-A2 everyday vocabulary, clear pauses.
- Intermediate: Standard natural English (3-4 clauses, 30-45 words), practical B1-B2 vocabulary, natural rhythm.
- Advanced: Rich native-level English (40-60 words), C1-C2 expressions, sophisticated sentence flow.

REQUIREMENTS:
1. Provide a clear natural English paragraph ('text').
2. Provide a slash-reading version ('slashedText') inserting ' / ' at natural breath/rhythm boundaries.
3. Provide an accurate, natural Japanese translation ('translation').
4. Provide 1-2 practical pronunciation & rhythm tips in Japanese ('tipsJa') (e.g. linking, accent, intonation).

Return strictly JSON matching this structure:
{
  "title": "Short punchy English title",
  "titleJa": "日本語のタイトル",
  "category": "Custom AI",
  "text": "Full English paragraph here",
  "slashedText": "Full English / paragraph with / natural breath pauses / here",
  "translation": "日本語訳テキスト",
  "tipsJa": "日本語でのワンポイント発音・リンキングのアドバイス"
}
`;

  const userPromptText = isRandomRequest
    ? `Please generate an engaging shadowing script on a randomly selected practical topic for a ${difficulty} level learner.`
    : `Please generate a shadowing script about "${topicInstruction}" for a ${difficulty} level learner.`;

  const contents = [
    { role: 'user', parts: [{ text: userPromptText }] }
  ];

  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      titleJa: { type: "STRING" },
      category: { type: "STRING" },
      text: { type: "STRING" },
      slashedText: { type: "STRING" },
      translation: { type: "STRING" },
      tipsJa: { type: "STRING" }
    },
    required: ["title", "titleJa", "category", "text", "slashedText", "translation", "tipsJa"]
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  const data = cleanAndParseJson(rawJson);

  return {
    ...data,
    id: `custom-script-${Date.now()}`,
    difficulty,
    difficultyLabel: difficulty === 'Beginner' ? '🌱 初級' : difficulty === 'Advanced' ? '🔥 上級' : '⚡ 中級'
  };
}

/**
 * Evaluate user's shadowing audio speech transcript against the original text using Gemini
 */
export async function evaluateShadowingPerformance({ apiKey, model, originalText, userSpeechText }) {
  if (!apiKey) throw new Error("Gemini APIキーを設定してください。");

  const systemPrompt = `
You are an expert English Pronunciation & Shadowing Coach.
Compare the original script text with the speech recognition transcript of what the user actually said.

Original Script: "${originalText}"
User's Speech Transcript: "${userSpeechText}"

EVALUATION GOALS:
1. Assess accuracy & completeness of speech (0-100 score).
2. Identify missing words, mispronounced/substituted words, or weak sound linking.
3. Provide supportive, actionable Japanese coaching feedback (2-3 sentences) focusing on rhythm, intonation, and linking.

Return strictly JSON with this structure:
{
  "score": 88,
  "feedbackJa": "素晴らしいシャドーイングです！後半の『look forward to』のリンキングも滑らかでした。特に『collaborating』のアクセントに注意するとさらに自然になります。",
  "strengthsJa": ["前半のスピード感が完璧です", "RとLの発音がクリアに認識されています"],
  "improvementsJa": ["最後の単語が途切れ気味だったので、最後まで息を吐ききって発声しましょう"]
}
`;

  const contents = [
    { role: 'user', parts: [{ text: `Original: "${originalText}"\nUser: "${userSpeechText}"\nEvaluate performance.` }] }
  ];

  const schema = {
    type: "OBJECT",
    properties: {
      score: { type: "INTEGER" },
      feedbackJa: { type: "STRING" },
      strengthsJa: { type: "ARRAY", items: { type: "STRING" } },
      improvementsJa: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["score", "feedbackJa", "strengthsJa", "improvementsJa"]
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  return cleanAndParseJson(rawJson);
}
