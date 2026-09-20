import { callGeminiApi, GeminiContent } from './client';
import { cleanAndParseJson, cleanPhrase } from '../../utils/jsonRepair';
import { 
  Situation, 
  ChatMessage, 
  CoachMessage, 
  CoachPhrase, 
  CoachMode, 
  CoachShadowingContext, 
  CoachBlitzContext,
  CoachConversationContext
} from '../../types';

export interface AskConversationCoachParams {
  apiKey: string;
  model?: string;
  mode?: CoachMode;
  situation?: Situation | null;
  history?: ChatMessage[];
  conversationContext?: CoachConversationContext | null;
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
  conversationContext,
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
${shadowingContext?.targetText ? `- Target Sentence:\n"${shadowingContext.targetText}"` : (shadowingContext?.fullText ? `- Script Text:\n"${shadowingContext.fullText}"` : '')}

YOUR FOCUS AS SHADOWING COACH:
- Explain pronunciation, connected speech (linking, reduction, flapping, elision), intonation, and rhythm.
- Explain grammar, sentence structure, and vocabulary nuances of the script.
- Give tips for shadowing techniques and listening comprehension.
`;
  } else if (mode === 'blitz' || blitzContext) {
    coachRoleDescription = 'You are an expert bilingual Instant English Composition Coach (瞬間英作文・即時英会話専属コーチ).';
    contextDescription = `
CURRENT LEARNING CONTEXT: Instant Oral Blitz (瞬間英作文トレーニング)
- Topic: ${blitzContext?.topicTitle || 'Instant English Composition'}
${blitzContext?.currentQuestion ? `- Current Japanese Prompt: "${blitzContext.currentQuestion.japanese}"\n- Standard English Answer: "${blitzContext.currentQuestion.sampleAnswer}"` : ''}

YOUR FOCUS AS BLITZ COACH:
- Explain word order, sentence construction speed, and English thought process patterns (英語脳・語順感覚).
- Explain why a specific grammar rule or phrasing applies here.
- Provide alternative natural expressions (casual vs formal, concise expressions).
`;
  } else if (situation) {
    contextDescription = `
CURRENT SCENARIO CONTEXT:
- Scenario Title: ${situation.title} (${situation.titleJa || ''})
- Target Difficulty: ${situation.difficulty || 'Intermediate'}
- AI Partner's Role: ${situation.systemRole}
- User's Role: ${situation.userRole || 'Learner'}
- Scenario Description: ${situation.descriptionJa || situation.description || ''}
- Scenario Goals: ${situation.goals ? situation.goals.map((g, i) => `${i + 1}. ${g}`).join(', ') : 'Natural conversation'}

YOUR FOCUS AS CONVERSATION COACH:
- Explain what the conversational partner meant, their nuance, and cultural etiquette.
- Provide natural and context-appropriate reply phrases.
- Help the user achieve their goals in this specific scenario without doing the conversation for them.
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
    promptContext = `【現在のシャドーイング特訓状況】\n` +
      `教材タイトル: ${shadowingContext.title}\n` +
      `カテゴリ: ${shadowingContext.category || 'General'}\n`;
    if (shadowingContext.targetText) {
      promptContext += `★練習中の対象英文★:\n"${shadowingContext.targetText}"\n\n`;
    } else if (shadowingContext.fullText) {
      promptContext += `★スクリプト全文★:\n"${shadowingContext.fullText}"\n\n`;
    }

    promptContext += `★ユーザーの練習・発話状況★\n`;
    if (shadowingContext.userSpeech && shadowingContext.userSpeech.trim()) {
      promptContext += `- ユーザーの録音発話テキスト: "${shadowingContext.userSpeech.trim()}"\n`;
      if (shadowingContext.evalResult) {
        if (shadowingContext.evalResult.overallScore !== undefined) {
          promptContext += `- 総合スコア: ${shadowingContext.evalResult.overallScore}点\n`;
        }
        if (shadowingContext.evalResult.feedbackJa) {
          promptContext += `- 発音評価フィードバック: ${shadowingContext.evalResult.feedbackJa}\n`;
        }
      }
    } else {
      promptContext += `- 発話状況: 【未録音（まだ発話練習を行っていません）】\n` +
        `※ユーザーはこれから練習を始めるところか、発音のコツや意味を事前に確認したい状態です。\n`;
    }
    promptContext += `\n【回答指針】\n` +
      `- ユーザーの「今回の質問・相談・コメント」に正面から直接回答してください。\n` +
      `- 練習対象の英文や実際の発話録音状況（録音テキストやスコア）は背景情報として活用し、質問内容に応じた実践的なアドバイスを行ってください。\n\n`;

  } else if (mode === 'blitz' && blitzContext) {
    const qIndexStr = blitzContext.currentIndex !== undefined && blitzContext.totalQuestions 
      ? `（第 ${blitzContext.currentIndex + 1} 問 / 全 ${blitzContext.totalQuestions} 問）` 
      : '';
    promptContext = `【現在の瞬間英作文トレーニング状況】\n` +
      `トピック: ${blitzContext.topicTitle} ${qIndexStr}\n\n`;

    if (blitzContext.currentQuestion) {
      promptContext += `★現在出題中のお題★\n` +
        `日本語のお題: 「${blitzContext.currentQuestion.japanese}」\n` +
        `標準の模範解答: "${blitzContext.currentQuestion.sampleAnswer}"\n` +
        `${blitzContext.currentQuestion.keyPoints && blitzContext.currentQuestion.keyPoints.length > 0 ? `文法ポイント: ${blitzContext.currentQuestion.keyPoints.join(', ')}\n` : ''}\n`;
    }

    promptContext += `★ユーザーの現在の回答・発話状況★\n`;
    if (blitzContext.userSpeech && blitzContext.userSpeech.trim()) {
      promptContext += `- ユーザーの回答音声テキスト: "${blitzContext.userSpeech.trim()}"\n`;
      if (blitzContext.isCorrect !== undefined && blitzContext.isCorrect !== null) {
        promptContext += `- 正誤判定: ${blitzContext.isCorrect ? '【正解・合格】' : '【惜しい・不正解】'}\n`;
      }
      if (blitzContext.aiEvaluation?.feedbackJa) {
        promptContext += `- AI発話添削フィードバック: ${blitzContext.aiEvaluation.feedbackJa}\n`;
      }
    } else {
      promptContext += `- 回答状況: 【未回答（まだ発話していません）】\n` +
        `※ユーザーはお題を見て、どう英語に組み立てればよいか考えている最中です。\n`;
    }
    promptContext += `- 模範解答の表示状態: ${blitzContext.isRevealed ? '模範解答確認済み' : '未表示（自力で考え中）'}\n\n`;
    promptContext += `【回答指針】\n` +
      `- ユーザーの「今回の質問・相談・コメント」に正面から直接回答してください。\n` +
      `- お題やユーザーの回答・判定結果は背景情報として活用し、質問内容に応じたアドバイスを行ってください。\n\n`;

  } else if (situation) {
    const reversedHistory = [...history].reverse();
    const latestAiMessage = reversedHistory.find(m => m.role === 'ai') || (situation.initialMessage ? { text: situation.initialMessage } : null);
    const latestUserMessage = reversedHistory.find(m => m.role === 'user');

    const formattedLog = history.length > 0
      ? history.map((item, idx) => `${idx + 1}. ${item.role === 'user' ? `User (${situation.userRole || 'Learner'})` : `AI Partner (${situation.systemRole})`}: "${item.text}"`).join('\n')
      : `1. AI Partner (${situation.systemRole}): "${situation.initialMessage}"`;

    const lastMessage = history.length > 0 ? history[history.length - 1] : (situation.initialMessage ? { role: 'ai', text: situation.initialMessage } : null);
    const isWaitingForUser = lastMessage?.role === 'ai';

    let userStatusDescription = '';
    if (isWaitingForUser) {
      userStatusDescription = `★ユーザーの現在の回答ステータス★: 【未回答（まだ返答していません）】\n` +
        `相手（${situation.systemRole}）から「"${latestAiMessage?.text || ''}"」と問いかけられた直後で、ユーザーはまだ返答していません。どう返信すれば良いか考えている最中です。\n`;
    } else {
      userStatusDescription = `★ユーザーの現在の回答ステータス★: 【返答済み】\n` +
        `ユーザーは直前に「"${latestUserMessage?.text || ''}"」と発言しました。\n`;
    }

    if (conversationContext?.currentUserInput && conversationContext.currentUserInput.trim()) {
      userStatusDescription += `- 現在ユーザーが入力欄に打ちかけの未送信テキスト: 「${conversationContext.currentUserInput.trim()}」\n`;
    }

    promptContext = `【現在の英会話ロールプレイ情報】\n` +
      `シチュエーション: ${situation.title} (${situation.titleJa || ''})\n` +
      `AIの役柄: ${situation.systemRole}\n` +
      `ユーザーの役柄: ${situation.userRole || 'Learner'}\n` +
      `達成目標: ${(situation.goals && situation.goals.length > 0) ? situation.goals.join(', ') : '自然な会話'}\n\n` +
      `【これまでの会話履歴（タイムライン順）】\n${formattedLog}\n\n` +
      `${userStatusDescription}\n`;

    if (latestAiMessage) {
      promptContext += `★最重要★【直前の相手（${situation.systemRole}）の最新発言】:\n"${latestAiMessage.text}"\n\n`;
    }
    if (latestUserMessage) {
      promptContext += `【直前のユーザーの最新発言】:\n"${latestUserMessage.text}"\n\n`;
    }

    promptContext += `【重要：回答の柔軟性と優先順位】\n` +
      `1. 最優先事項: ユーザーの「今回の質問・相談・コメント」に対して、正面から直接的・具体的に回答してください。\n` +
      `   - ユーザーが特定の単語の意味、文法、文化・マナー、雑談、あるいは別の言いたいことを聞いてきた場合は、その質問に対して明確かつ親身に答えてください。\n` +
      `   - ユーザーからのコメントが短い相槌や感想（例:「わかった」「ありがとう」「難しい」など）の場合も、定型文を繰り返さず、前向きな励ましや次のステップを自然な日本語で返してください。\n` +
      `2. 背景情報の参照: 直前の相手の発言（"${latestAiMessage?.text || ''}"）やロールプレイの状況は、ユーザーの質問を理解するための「背景」として活用してください。\n` +
      `   - 「相手の発言の意図を教えて」や「何て返せばいい？」と聞かれた時のみ、相手の発言の解説や返答選択肢を提供してください。\n` +
      `   - ユーザーが質問していないのに、毎回同じように「相手は〜〜と言っています」「返答としては〜〜です」と決まり文句で前置きしたり、定型的な説明を繰り返すことは【厳禁】です。\n` +
      `3. バリエーションと自然な対話:\n` +
      `   - 過去の相談履歴とまったく同じ言い回しや定型文の繰り返しを避け、ユーザーの今回のコメントに応じた新鮮で役立つアドバイスをしてください。\n` +
      `   - "suggestedPhrases" は、ユーザーの今回の質問・意図に真に関連するフレーズのみを提供してください（関連フレーズがない場合は空配列 []）。\n\n`;
  }

  let promptText = promptContext;

  // Include recent coach conversation if any (filter out greeting and truncate to prevent echo loops)
  const meaningfulHistory = (coachHistory || []).filter(ch => ch.id !== 'coach-init');
  if (meaningfulHistory.length > 0) {
    promptText += `【これまでのコーチへの相談履歴】\n`;
    meaningfulHistory.slice(-4).forEach(ch => {
      const truncatedText = ch.text.length > 120 ? `${ch.text.slice(0, 120)}...` : ch.text;
      promptText += `${ch.role === 'user' ? 'ユーザー' : 'コーチ'}: ${truncatedText}\n`;
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
        .map(p => ({
          english: cleanPhrase(p?.english),
          japanese: p?.japanese || ''
        }))
        .filter((p): p is CoachPhrase => Boolean(p.english))
    : [];

  return {
    answer: parsed.answer,
    suggestedPhrases: cleanedPhrases
  };
}
