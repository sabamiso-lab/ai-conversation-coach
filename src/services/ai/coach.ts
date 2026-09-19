import { callGeminiApi, GeminiContent } from './client';
import { cleanAndParseJson, cleanPhrase } from '../../utils/jsonRepair';
import { 
  Situation, 
  ChatMessage, 
  CoachMessage, 
  CoachPhrase, 
  CoachMode, 
  CoachShadowingContext, 
  CoachBlitzContext 
} from '../../types';

export interface AskConversationCoachParams {
  apiKey: string;
  model?: string;
  mode?: CoachMode;
  situation?: Situation | null;
  history?: ChatMessage[];
  shadowingContext?: CoachShadowingContext | null;
  blitzContext?: CoachBlitzContext | null;
  question: string;
  coachHistory?: CoachMessage[];
}

export interface CoachResponse {
  answer: string;
  suggestedPhrases: CoachPhrase[];
}

/**
 * Ask Gemini as a conversation/learning coach with mode-specific context
 */
export async function askConversationCoach({
  apiKey,
  model,
  mode = 'conversation',
  situation,
  history = [],
  shadowingContext,
  blitzContext,
  question,
  coachHistory = []
}: AskConversationCoachParams): Promise<CoachResponse> {
  if (!apiKey) {
    throw new Error("Gemini API key is required. Please set your API key in settings.");
  }

  let contextDescription = '';
  let coachRoleDescription = 'You are an expert bilingual English Conversation Coach & Learning Mentor (バイリンガル英会話専属コーチ).';

  if (mode === 'shadowing' || shadowingContext) {
    coachRoleDescription = 'You are an expert bilingual English Pronunciation & Shadowing Coach (シャドーイング＆発音・リスニング専属コーチ).';
    contextDescription = `
CURRENT LEARNING CONTEXT: Shadowing Practice (シャドーイング特訓)
- Title: ${shadowingContext?.title || '英語シャドーイング'}
- Category: ${shadowingContext?.category || 'General'}
${shadowingContext?.fullText ? `- Script Text:\n"${shadowingContext.fullText}"` : ''}

YOUR FOCUS AS SHADOWING COACH:
- Explain pronunciation, connected speech (linking, reduction, flapping, elision), intonation, and rhythm.
- Explain grammar breakdown, sentence parsing, and semantic nuances of the script.
- Provide practical methods to shadow smoothly without getting tongue-tied.
`;
  } else if (mode === 'blitz' || blitzContext) {
    coachRoleDescription = 'You are an expert bilingual Oral Translation & Pattern Practice Coach (瞬間英作文＆パターンプラクティス専属コーチ).';
    contextDescription = `
CURRENT LEARNING CONTEXT: Instant Oral Blitz (瞬間英作文・パターンプラクティス)
- Topic: ${blitzContext?.topicTitle || '瞬間英作文トレーニング'}
${blitzContext?.currentQuestion ? `
- Current Japanese Prompt: "${blitzContext.currentQuestion.japanese}"
- Standard English Answer: "${blitzContext.currentQuestion.sampleAnswer}"
- Target Key Points: ${(blitzContext.currentQuestion.keyPoints || []).join(', ')}
` : ''}

YOUR FOCUS AS ORAL BLITZ COACH:
- Explain why this grammar, word order, or phrasing is used.
- Provide alternative natural expressions and explain subtle nuance differences between variations.
- Share tips for outputting English patterns instantly without overthinking or word-by-word translation.
`;
  } else if (situation) {
    contextDescription = `
CURRENT SCENARIO CONTEXT:
- Scenario Title: ${situation.title} (${situation.titleJa || ''})
- Target Difficulty: ${situation.difficulty || 'Intermediate'}
- AI Partner's Role: ${situation.systemRole}
- User's Role: ${situation.userRole || 'Learner'}
- Scenario Description: ${situation.descriptionJa || situation.description || ''}
- Scenario Goals: ${(situation.goals && situation.goals.length > 0) ? situation.goals.map((g, i) => `${i + 1}. ${g}`).join(', ') : 'Natural conversation'}

YOUR FOCUS AS CONVERSATION COACH:
- Explain what the conversational partner meant, their nuance, and cultural etiquette.
- Provide natural and context-appropriate reply phrases.
`;
  } else {
    contextDescription = `
CURRENT CONTEXT:
The user is browsing topics or seeking general English learning advice.
`;
  }

  const systemPrompt = `
${coachRoleDescription}
The user has opened a floating assistant to ask you a question or seek advice in Japanese.
${contextDescription}

YOUR MISSION AS A COACH:
1. Answer the user's question clearly, warmly, and concisely in Japanese.
2. Rely heavily on the provided learning context and materials to give specific, practical real-world advice.
3. If applicable or helpful, provide practical, ready-to-use English phrases in "suggestedPhrases" that the user can immediately practice, speak, or use.
   - Each phrase must have "english" and "japanese" (translation / nuance).
   - If no specific phrases are relevant, "suggestedPhrases" can be an empty array [].
4. Formatting:
   - Make the "answer" easy to read with bullet points or paragraphs. Keep it encouraging, supportive, and practical!

Return your response strictly as JSON with this structure:
{
  "answer": "親身で分かりやすい日本語での解説・アドバイス",
  "suggestedPhrases": [
    {
      "english": "Example phrase",
      "japanese": "フレーズの日本語訳やニュアンス"
    }
  ]
}
`;

  // Build context log for prompt
  let promptContext = '';
  if (mode === 'shadowing' && shadowingContext) {
    promptContext = `【シャドーイング学習情報】\nタイトル: ${shadowingContext.title}\nカテゴリ: ${shadowingContext.category || ''}\n${shadowingContext.fullText ? `英文スクリプト全文:\n"${shadowingContext.fullText}"\n` : ''}\n`;
  } else if (mode === 'blitz' && blitzContext) {
    promptContext = `【瞬間英作文トレーニング情報】\nトピック: ${blitzContext.topicTitle}\n`;
    if (blitzContext.currentQuestion) {
      promptContext += `★現在出題中の問題★\n日本語のお題: 「${blitzContext.currentQuestion.japanese}」\n標準の解答英語: "${blitzContext.currentQuestion.sampleAnswer}"\n${blitzContext.currentQuestion.keyPoints ? `文法ポイント: ${blitzContext.currentQuestion.keyPoints.join(', ')}\n` : ''}\n`;
    }
  } else if (situation) {
    // Find the latest AI utterance and latest user utterance
    const reversedHistory = [...history].reverse();
    const latestAiMessage = reversedHistory.find(m => m.role === 'ai') || (situation.initialMessage ? { text: situation.initialMessage } : null);
    const latestUserMessage = reversedHistory.find(m => m.role === 'user');

    const formattedLog = history.length > 0
      ? history.map((item, idx) => `${idx + 1}. ${item.role === 'user' ? `User (${situation.userRole || 'Learner'})` : `AI Partner (${situation.systemRole})`}: "${item.text}"`).join('\n')
      : `1. AI Partner (${situation.systemRole}): "${situation.initialMessage}"`;

    promptContext = `【現在の英会話ロールプレイ情報】\n` +
      `シチュエーション: ${situation.title} (${situation.titleJa || ''})\n` +
      `AIの役柄: ${situation.systemRole}\n` +
      `ユーザーの役柄: ${situation.userRole || 'Learner'}\n` +
      `達成目標: ${(situation.goals && situation.goals.length > 0) ? situation.goals.join(', ') : '自然な会話'}\n\n` +
      `【これまでの会話履歴（タイムライン順）】\n${formattedLog}\n\n`;

    if (latestAiMessage) {
      promptContext += `★重要★【直前の相手（${situation.systemRole}）の最新発言】:\n"${latestAiMessage.text}"\n\n`;
    }
    if (latestUserMessage) {
      promptContext += `【直前のユーザーの最新発言】:\n"${latestUserMessage.text}"\n\n`;
    }

    promptContext += `※重要指示: ユーザーは上記の会話の真っ最中です。回答する際は、必ず上記の会話ログおよび直前の相手の発言（"${latestAiMessage?.text || ''}"）を明確に踏まえ、その発言の意図や具体的な返答の選択肢を親切に解説してください。一般的な定型文ではなく、この会話の現在の状況に直結したアドバイスをしてください。\n\n`;
  }

  let promptText = promptContext;

  // Include recent coach conversation if any
  if (coachHistory && coachHistory.length > 0) {
    promptText += `【これまでのコーチへの相談履歴】\n`;
    coachHistory.slice(-4).forEach(ch => {
      promptText += `${ch.role === 'user' ? 'ユーザー' : 'コーチ'}: ${ch.text}\n`;
    });
    promptText += `\n`;
  }

  promptText += `【ユーザーの今回の質問・相談】\n${question}\n\n上記コンテキストを踏まえて、親切に回答してください。`;

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
