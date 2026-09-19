import { callGeminiApi, GeminiContent } from './client';
import { cleanAndParseJson, cleanPhrase } from '../../utils/jsonRepair';
import { Situation, ChatMessage, CoachMessage, CoachPhrase } from '../../types';

export interface AskConversationCoachParams {
  apiKey: string;
  model?: string;
  situation?: Situation | null;
  history?: ChatMessage[];
  question: string;
  coachHistory?: CoachMessage[];
}

export interface CoachResponse {
  answer: string;
  suggestedPhrases: CoachPhrase[];
}

/**
 * Ask Gemini as a conversation coach about the current conversation context
 */
export async function askConversationCoach({
  apiKey,
  model,
  situation,
  history = [],
  question,
  coachHistory = []
}: AskConversationCoachParams): Promise<CoachResponse> {
  if (!apiKey) {
    throw new Error("Gemini API key is required. Please set your API key in settings.");
  }

  const scenarioContext = situation ? `
CURRENT SCENARIO CONTEXT:
- Scenario Title: ${situation.title} (${situation.titleJa || ''})
- Target Difficulty: ${situation.difficulty || 'Intermediate'}
- AI Partner's Role: ${situation.systemRole}
- User's Role: ${situation.userRole || 'Learner'}
- Scenario Description: ${situation.descriptionJa || situation.description || ''}
- Scenario Goals: ${(situation.goals && situation.goals.length > 0) ? situation.goals.map((g, i) => `${i + 1}. ${g}`).join(', ') : 'Natural conversation'}
` : `
CURRENT CONTEXT:
The user is browsing conversation topics or seeking general English conversation and learning advice.
`;

  const systemPrompt = `
You are an expert bilingual English Conversation Coach & Learning Mentor (バイリンガル英会話専属コーチ).
The user has opened a floating assistant to ask you a question or seek advice in Japanese.
${scenarioContext}
YOUR MISSION AS A COACH:
1. Answer the user's question clearly, warmly, and concisely in Japanese.
2. If in a conversation scenario, rely heavily on the provided conversation history and current scenario context to give contextualized, practical real-world advice (e.g., explaining what the AI partner meant, the nuance of a phrase, cultural etiquette/customs, or what the user can reply next).
3. If applicable or helpful, provide practical, ready-to-use English phrases in "suggestedPhrases" that the user can immediately speak or use.
   - Each phrase must have "english" and "japanese" (translation / nuance).
   - If no specific phrases are relevant (e.g. pure cultural or general question), "suggestedPhrases" can be an empty array [].
4. Formatting:
   - Make the "answer" easy to read with bullet points or paragraphs. Keep it encouraging, supportive, and practical for living or traveling abroad!

Return your response strictly as JSON with this structure:
{
  "answer": "親身で分かりやすい日本語での解説・アドバイス",
  "suggestedPhrases": [
    {
      "english": "Could I get this to go, please?",
      "japanese": "これをお持ち帰りでお願いできますか？"
    }
  ]
}
`;

  // Format conversation history
  const formattedConversationLog = history.length > 0
    ? history.map(item => `${item.role === 'user' ? 'User' : `AI Partner (${situation?.systemRole || 'AI'})`}: ${item.text}`).join('\n')
    : situation?.initialMessage
      ? `(まだ会話は始まっていません。AIの初期挨拶: "${situation.initialMessage}")`
      : '(会話セッション開始前)';

  let promptText = situation
    ? `【現在の英会話ロールプレイの会話ログ】\n${formattedConversationLog}\n\n`
    : `【現在の状況】シチュエーション選択画面\n\n`;

  // Include recent coach conversation if any
  if (coachHistory && coachHistory.length > 0) {
    promptText += `【これまでのコーチへの相談履歴】\n`;
    coachHistory.slice(-4).forEach(ch => {
      promptText += `${ch.role === 'user' ? 'ユーザー' : 'コーチ'}: ${ch.text}\n`;
    });
    promptText += `\n`;
  }

  promptText += `【ユーザーの今回の質問・相談】\n${question}\n\n会話ログの文脈を踏まえて、親切に回答してください。`;

  const contents: GeminiContent[] = [
    {
      role: 'user',
      parts: [{ text: promptText }]
    }
  ];

  const schema = {
    type: "OBJECT",
    properties: {
      answer: { type: "STRING" },
      suggestedPhrases: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            english: { type: "STRING" },
            japanese: { type: "STRING" }
          },
          required: ["english", "japanese"]
        }
      }
    },
    required: ["answer", "suggestedPhrases"]
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  let parsed: CoachResponse | null = null;
  try {
    parsed = cleanAndParseJson(rawJson) as CoachResponse | null;
  } catch {
    return {
      answer: typeof rawJson === 'string' && rawJson.trim() ? rawJson : "回答の生成に失敗しました。もう一度お試しください。",
      suggestedPhrases: []
    };
  }

  if (!parsed || !parsed.answer) {
    return {
      answer: typeof rawJson === 'string' && rawJson.trim() ? rawJson : "回答の生成に失敗しました。もう一度お試しください。",
      suggestedPhrases: []
    };
  }

  // Clean suggested phrases
  const cleanedPhrases: CoachPhrase[] = Array.isArray(parsed.suggestedPhrases)
    ? parsed.suggestedPhrases
        .filter(p => p && p.english)
        .map(p => ({
          english: cleanPhrase(p.english),
          japanese: p.japanese || ''
        }))
    : [];

  return {
    answer: parsed.answer,
    suggestedPhrases: cleanedPhrases
  };
}
