import { callGeminiApi, GeminiContent } from './client';
import {
  truncateRepetitiveLoops,
  cleanPhrase,
  cleanAndParseJson
} from '../../utils/jsonRepair';
import { Situation } from '../../types';

export interface SendChatMessageOptions {
  apiKey: string;
  model?: string;
  situation: Situation;
  history: Array<{ role: 'user' | 'ai' | 'model'; text: string }>;
  userText: string;
}

export interface SendChatMessageResult {
  aiResponseText: string;
  aiResponseTranslation: string;
  userTextTranslation: string;
  clarityStatus: 'FULL' | 'PARTIAL' | 'UNCLEAR';
  clarityBadgeJa: string;
  clarityFeedbackJa: string;
  simpleAlternative?: string | null;
  betterPhrasing?: string | null;
  phrasingTip?: string | null;
}

export interface GetHintSuggestionsOptions {
  apiKey: string;
  model?: string;
  situation: Situation;
  history: Array<{ role: 'user' | 'ai' | 'model'; text: string }>;
}

export interface HintSuggestionItem {
  english: string;
  japanese: string;
  difficulty: string;
  nuance?: string;
}

export interface GenerateSessionReportOptions {
  apiKey: string;
  model?: string;
  situation: Situation;
  history: Array<{ role: 'user' | 'ai' | 'model'; text: string }>;
}

export interface SessionReportResult {
  overallScore: number;
  grammarScore: number;
  vocabScore: number;
  fluencyScore: number;
  summaryJa: string;
  strengthsJa: string[];
  improvementsJa: string[];
  keyPhrases: Array<{ phrase: string; meaning: string }>;
  goalsAchieved: Array<{ goal: string; achieved: boolean }>;
}

/**
 * Helper to build sanitized Gemini contents adhering strictly to Gemini API requirements:
 * 1. First turn MUST be 'user'
 * 2. Turns MUST alternate between 'user' and 'model'
 */
export function buildChatContents(
  situation: Situation,
  history: Array<{ role: 'user' | 'ai' | 'model'; text: string }>,
  userText: string
): GeminiContent[] {
  const rawTurns: Array<{ role: 'user' | 'model'; text: string }> = [];

  const hasHistory = history.length > 0;
  const startsWithAi = hasHistory
    ? history[0].role === 'ai' || history[0].role === 'model'
    : Boolean(situation.initialMessage);

  if (startsWithAi) {
    rawTurns.push({
      role: 'user',
      text: '[Starts the scenario conversation]'
    });
  }

  if (!hasHistory && situation.initialMessage) {
    rawTurns.push({
      role: 'model',
      text: situation.initialMessage
    });
  }

  history.forEach(item => {
    const role: 'user' | 'model' = item.role === 'user' ? 'user' : 'model';
    rawTurns.push({ role, text: item.text });
  });

  rawTurns.push({
    role: 'user',
    text: userText
  });

  // Ensure alternating user/model roles and non-empty texts
  const sanitized: GeminiContent[] = [];

  for (const turn of rawTurns) {
    const trimmedText = turn.text.trim();
    if (!trimmedText) continue;

    const last = sanitized[sanitized.length - 1];
    if (last && last.role === turn.role) {
      // Merge consecutive same-role turns
      last.parts[0].text += `\n${trimmedText}`;
    } else {
      sanitized.push({
        role: turn.role,
        parts: [{ text: trimmedText }]
      });
    }
  }

  // Ensure the very first turn is always 'user'
  if (sanitized.length === 0 || sanitized[0].role !== 'user') {
    sanitized.unshift({
      role: 'user',
      parts: [{ text: '[Starts the scenario conversation]' }]
    });
  }

  return sanitized;
}

/**
 * Send a chat turn to Gemini and receive roleplay response + user feedback
 */
export async function sendChatMessage({
  apiKey,
  model,
  situation,
  history,
  userText
}: SendChatMessageOptions): Promise<SendChatMessageResult> {
  if (!apiKey) {
    throw new Error("Gemini API key is required. Please set your API key in settings.");
  }

  const systemPrompt = `
You are acting as an English conversation tutor helping the user master practical, real-world English for living abroad.
Scenario Title: ${situation.title}
Target Difficulty Level: ${situation.difficulty || 'Intermediate'}
Your Persona / Role: ${situation.systemRole}
User Role: ${situation.userRole || 'Learner'}
Scenario Context: ${situation.description || situation.descriptionJa}

Scenario Mission Goals:
${(situation.goals && situation.goals.length > 0) ? situation.goals.map((g, i) => `${i + 1}. ${g}`).join('\n') : '1. Have a natural, productive English conversation.'}

DIFFICULTY LEVEL RESPONSE GUIDELINE:
- Beginner Level: Use clear, simple, short English sentences (1-2 sentences). Use basic everyday words (A1-A2). Avoid complex grammar or idiom overload.
- Intermediate Level: Use natural, standard practical English (2-3 sentences) suitable for everyday and business communication.
- Advanced Level: Use native-level, rich vocabulary, nuanced expressions, and thought-provoking questions (2-3 sentences).

CONVERSATION PROGRESSION & ANTI-LOOPING GUIDELINES:
- **Progress the Conversation Forward**: Every response MUST advance the scenario logically. Do NOT keep asking the same question or confirming details that were already answered or settled in the conversation history. Move to the next logical phase of the interaction (e.g. take order -> confirm options -> request payment -> finalize & hand over items).
- **Avoid Topic & Question Loops**: Review the previous conversation history carefully. Never repeat or re-phrase a question that has already been asked or answered.
- **Smooth Scenario Wrap-Up**: When the Scenario Mission Goals are fulfilled or the transaction/discussion reaches a natural conclusion, wrap up the conversation warmly in character (e.g., "Here is your keycard! Have a wonderful stay!"). Do NOT force unnecessary follow-up questions when the interaction is logically complete.

EVALUATION PHILOSOPHY:
Prioritize COMMUNICATIVE INTENT and MEANING CLARITY over perfect grammar or sophisticated vocabulary.
Even if the user makes grammatical errors, if their core message would be clearly understood by a local native speaker in real life, judge it as "FULL" (100% 意図が伝わった!).
Always provide reassuring, positive feedback in Japanese so the user gains confidence in speaking!

CRITICAL FEEDBACK STYLE RULES:
- Keep 'clarityFeedbackJa' helpful, natural, encouraging, and concise (up to 200 Japanese characters, around 1-3 sentences max).
- DO NOT repeat identical or similar praise words (e.g. "素晴らしい！最高！グッジョブ！") in a loop. Provide genuine, specific feedback instead of repetitive exclamation spam.
- 'simpleAlternative' MUST be EXACTLY ONE short, clear, easy English phrase (15 words max). DO NOT include Japanese, extra commentary, numbered lists, or quotes inside.
- 'betterPhrasing' MUST be EXACTLY ONE natural native English expression (or null if user text is already native). DO NOT include Japanese or extra commentary.

YOUR MISSION:
1. Stay strictly in character as "${situation.systemRole}" and respond naturally in English according to the Target Difficulty Level and CONVERSATION PROGRESSION GUIDELINES.
2. Analyze the user's statement ("${userText}") for communicative intent:
   - clarityStatus: "FULL" (100%意図が伝わった), "PARTIAL" (おおむね伝わった), or "UNCLEAR" (伝わりづらい)
   - clarityBadgeJa: e.g. "🟢 100% 意図が伝わった！", "🟡 おおむね伝わった", "🔴 伝わりづらい"
   - clarityFeedbackJa: Encouraging Japanese feedback explaining how their intent reached the listener (up to 200 characters max, e.g. "多少の文法ミスはありますが、『お湯が出なくて困っている』という核心の意思は100%相手に伝わっています！").
   - simpleAlternative: A super simple, easy English phrase (using basic middle-school words) to convey the same intent effortlessly.
   - betterPhrasing: A natural native expression suggestion (or null if already natural).
3. Provide Japanese translations for BOTH the user's input and your AI response.

Return your response strictly as JSON with this structure:
{
  "aiResponseText": "Your in-character English response here",
  "aiResponseTranslation": "AIレスポンスの自然な日本語訳",
  "userTextTranslation": "ユーザーの発言の日本語訳",
  "clarityStatus": "FULL",
  "clarityBadgeJa": "🟢 100% 意図が伝わった！",
  "clarityFeedbackJa": "日本語での評価・励ましフィードバック",
  "simpleAlternative": "Could I get a coffee, please?",
  "betterPhrasing": "May I have a cup of coffee?",
  "phrasingTip": "ワンポイント解説（日本語、任意）"
}
`;

  // Format conversation history for Gemini API
  const contents = buildChatContents(situation, history, userText);

  const schema = {
    type: "OBJECT",
    properties: {
      aiResponseText: { type: "STRING" },
      aiResponseTranslation: { type: "STRING" },
      userTextTranslation: { type: "STRING" },
      clarityStatus: { type: "STRING" },
      clarityBadgeJa: { type: "STRING" },
      clarityFeedbackJa: { type: "STRING" },
      simpleAlternative: { type: "STRING", nullable: true },
      betterPhrasing: { type: "STRING", nullable: true },
      phrasingTip: { type: "STRING", nullable: true }
    },
    required: ["aiResponseText", "aiResponseTranslation", "userTextTranslation", "clarityStatus", "clarityBadgeJa", "clarityFeedbackJa"]
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  const parsed = cleanAndParseJson<SendChatMessageResult>(rawJson);
  if (parsed) {
    if (parsed.clarityFeedbackJa) {
      parsed.clarityFeedbackJa = truncateRepetitiveLoops(parsed.clarityFeedbackJa);
    }
    if (parsed.simpleAlternative) {
      parsed.simpleAlternative = cleanPhrase(parsed.simpleAlternative);
    }
    if (parsed.betterPhrasing) {
      parsed.betterPhrasing = cleanPhrase(parsed.betterPhrasing);
    }
  }
  return parsed;
}

/**
 * Generate 3 hint options for what the user can say next
 */
export async function getHintSuggestions({
  apiKey,
  model,
  situation,
  history
}: GetHintSuggestionsOptions): Promise<HintSuggestionItem[]> {
  if (!apiKey) throw new Error("API Key required");

  const systemPrompt = `
You are a helpful English conversation coach. The user is participating in this scenario:
Scenario: ${situation.title} (${situation.userRole || 'Learner'})

Based on the conversation history so far, generate 3 different practical ideas/sentences the user could say next to keep the conversation going or fulfill their scenario goals (${situation.goals ? situation.goals.join(', ') : ''}).

Return strictly a JSON array of 3 hint objects:
[
  {
    "english": "Example English phrase 1",
    "japanese": "日本語訳 1",
    "difficulty": "Easy"
  },
  {
    "english": "Example English phrase 2",
    "japanese": "日本語訳 2",
    "difficulty": "Medium"
  },
  {
    "english": "Example English phrase 3",
    "japanese": "日本語訳 3",
    "difficulty": "Natural/Advanced"
  }
]
`;

  const formattedHistory = history.length > 0 
    ? history.map(item => `${item.role === 'user' ? 'User' : 'AI Coach'}: ${item.text}`).join('\n')
    : `AI Coach: ${situation.initialMessage}`;

  const contents: GeminiContent[] = [
    {
      role: 'user',
      parts: [{
        text: `Here is the conversation log so far:\n\n${formattedHistory}\n\nPlease generate 3 hint suggestions for what the user could say next.`
      }]
    }
  ];

  const schema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        english: { type: "STRING" },
        japanese: { type: "STRING" },
        difficulty: { type: "STRING" }
      },
      required: ["english", "japanese", "difficulty"]
    }
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  return cleanAndParseJson<HintSuggestionItem[]>(rawJson);
}

/**
 * Generate comprehensive post-session evaluation report
 */
export async function generateSessionReport({
  apiKey,
  model,
  situation,
  history
}: GenerateSessionReportOptions): Promise<SessionReportResult> {
  if (!apiKey) throw new Error("API Key required");

  const systemPrompt = `
You are an expert English Language Coach focused on REAL-WORLD SURVIVAL ENGLISH FOR LIVING ABROAD.
Evaluate the user's performance in this conversation roleplay based on COMMUNICATIVE SUCCESS and MEANING CLARITY.
Scenario: ${situation.title}
Target Goals: ${situation.goals ? situation.goals.join(', ') : ''}

EVALUATION PHILOSOPHY:
The most important metric is whether the user managed to communicate their intent and solve problems in real-life, regardless of minor grammatical errors or simple vocabulary.

Analyze all user inputs in the conversation history for:
1. Communication & Intent Score (0-100 score) - How effectively did their message reach the listener?
2. Practical Vocabulary Score (0-100 score) - How well did they use simple, clear words?
3. Conversation Flow Score (0-100 score) - How well did they keep the conversation going?

Provide:
- Overall Score (0-100)
- Detailed Feedback in Japanese (Reassuring feedback on how well their intent was delivered, plus practical tips for living abroad)
- Key Survival Phrases Learned (3-5 practical phrases with English & Japanese)
- Scenario Goals Achievement status (which goals were completed)

Return strictly JSON matching this structure:
{
  "overallScore": 85,
  "grammarScore": 85,
  "vocabScore": 88,
  "fluencyScore": 85,
  "summaryJa": "全体の講評テキスト（『文法ミスがあっても意思疎通はバッチリできています！』など、海外で生き抜く自信を届ける温かいアドバイス）",
  "strengthsJa": ["伝わり方の良かった点1", "意思疎通の良かった点2"],
  "improvementsJa": ["さらに簡単に伝えるコツ1", "海外生活でのワンポイント2"],
  "keyPhrases": [
    { "phrase": "Could I get...", "meaning": "〜をいただけますか" }
  ],
  "goalsAchieved": [
    { "goal": "Goal description", "achieved": true }
  ]
}
`;

  const formattedHistory = history.length > 0
    ? history.map(item => `${item.role === 'user' ? 'User' : 'AI Coach'}: ${item.text}`).join('\n')
    : `AI Coach: ${situation.initialMessage}`;

  const contents: GeminiContent[] = [
    {
      role: 'user',
      parts: [{
        text: `Here is the full conversation log for this session:\n\n${formattedHistory}\n\nPlease evaluate the user's performance based on the conversation log above and return the evaluation report JSON.`
      }]
    }
  ];

  const schema = {
    type: "OBJECT",
    properties: {
      overallScore: { type: "INTEGER" },
      grammarScore: { type: "INTEGER" },
      vocabScore: { type: "INTEGER" },
      fluencyScore: { type: "INTEGER" },
      summaryJa: { type: "STRING" },
      strengthsJa: { type: "ARRAY", items: { type: "STRING" } },
      improvementsJa: { type: "ARRAY", items: { type: "STRING" } },
      keyPhrases: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            phrase: { type: "STRING" },
            meaning: { type: "STRING" }
          },
          required: ["phrase", "meaning"]
        }
      },
      goalsAchieved: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            goal: { type: "STRING" },
            achieved: { type: "BOOLEAN" }
          },
          required: ["goal", "achieved"]
        }
      }
    },
    required: ["overallScore", "grammarScore", "vocabScore", "fluencyScore", "summaryJa", "strengthsJa", "improvementsJa", "keyPhrases", "goalsAchieved"]
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  return cleanAndParseJson<SessionReportResult>(rawJson);
}
