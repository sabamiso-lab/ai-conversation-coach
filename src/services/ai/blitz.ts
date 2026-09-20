import { callGeminiApi } from './client';
import { cleanAndParseJson } from '../../utils/jsonRepair';
import { BlitzQuestion } from '../../types';

export interface GenerateBlitzQuestionsOptions {
  apiKey: string;
  model?: string;
  topicPrompt?: string;
  difficulty?: string;
  count?: number;
}

export interface GenerateBlitzQuestionsResult {
  title: string;
  questions: BlitzQuestion[];
}

export interface EvaluateBlitzSpeechOptions {
  apiKey: string;
  model?: string;
  prompt: string;
  standardAnswer: string;
  acceptedAnswers?: string[];
  grammarPoint?: string;
  userSpeech: string;
}

export interface BlitzSpeechEvaluationResult {
  isCorrect: boolean;
  status: 'PERFECT' | 'ACCEPTABLE' | 'NEEDS_WORK';
  statusLabelJa: string;
  score: number;
  evaluationJa: string;
  improvedSpeech: string;
  grammarAdviceJa?: string;
}

/**
 * Generate Instant Oral Translation (瞬間英作文) questions using Gemini
 */
export async function generateBlitzQuestions({
  apiKey,
  model,
  topicPrompt,
  difficulty = 'Intermediate',
  count = 10
}: GenerateBlitzQuestionsOptions): Promise<GenerateBlitzQuestionsResult> {
  if (!apiKey) throw new Error("Gemini APIキーを設定してください。");

  const isRandomRequest = !topicPrompt || !topicPrompt.trim() || topicPrompt.trim() === 'おまかせ' || topicPrompt.trim() === 'ランダム';
  const topicInstruction = isRandomRequest
    ? 'Select a highly realistic, specific English conversation scenario or theme completely at random by yourself (e.g. daily troubles, business negotiations, travel hassles, casual social chats, technology/AI, medical inquiries, or hobbies). Choose a fresh, practical, and engaging topic, avoiding generic simple greetings.'
    : topicPrompt.trim();

  const systemPrompt = `
You are an expert English Conversation Coach specializing in Instant Oral Translation (瞬間英作文) and Pattern Practice.
Generate a set of ${count} high-quality, practical Instant Oral Translation questions based on the requested topic and target difficulty level.

Target Difficulty: ${difficulty}
Topic/Context: "${topicInstruction}"

REQUIREMENTS:
1. If the topic was selected randomly by you, provide a clear, specific Japanese title summarizing the chosen theme in "title" (e.g. "海外ホテルの部屋変更交渉" or "リモートワークでの進捗報告").
2. Align question complexity strictly with ${difficulty} level:
   - Beginner: Basic SVO, be-verbs, can/will, simple past/future.
   - Intermediate: Present perfect, passive voice, indirect questions, practical idioms.
   - Advanced: Subjunctive mood, complex clause structures, professional nuanced phrasing.
3. Each question must have:
   - "prompt": A clear, natural Japanese prompt sentence.
   - "answer": The most natural, standard English translation.
   - "acceptedAnswers": An array of 2-3 alternative valid English phrasing options.
   - "explanation": Brief, clear Japanese explanation of the grammar point or phrase usage (1-2 sentences).
   - "grammarPoint": Short label for the key grammar or phrase point (e.g., "should have + p.p.", "take for granted").
4. Ensure the English sentences sound 100% natural and idiomatic in modern conversational English.

Return strictly JSON with this structure:
{
  "title": "Topic title in Japanese",
  "questions": [
    {
      "id": "q-1",
      "prompt": "日本語出題文",
      "answer": "Standard English answer.",
      "acceptedAnswers": ["Alternative 1", "Alternative 2"],
      "explanation": "解説文（日本語）",
      "grammarPoint": "キー構文"
    }
  ]
}
`;

  const userPromptText = isRandomRequest
    ? `Generate ${count} Instant Oral Translation questions on a randomly selected practical topic at level: ${difficulty}.`
    : `Generate ${count} Instant Oral Translation questions for topic: "${topicInstruction}" at level: ${difficulty}.`;

  const contents = [
    { role: 'user' as const, parts: [{ text: userPromptText }] }
  ];

  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            prompt: { type: "STRING" },
            answer: { type: "STRING" },
            acceptedAnswers: { type: "ARRAY", items: { type: "STRING" } },
            explanation: { type: "STRING" },
            grammarPoint: { type: "STRING" }
          },
          required: ["prompt", "answer", "acceptedAnswers", "explanation", "grammarPoint"]
        }
      }
    },
    required: ["title", "questions"]
  };

  interface RawBlitzQuestion {
    id?: string;
    prompt: string;
    answer: string;
    acceptedAnswers?: string[];
    explanation?: string;
    grammarPoint?: string;
  }

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  const data = cleanAndParseJson<{ title?: string; questions?: RawBlitzQuestion[] }>(rawJson);

  const questions: BlitzQuestion[] = (data.questions || []).map((q, idx) => ({
    ...q,
    id: q.id || `gen-${Date.now()}-${idx}`,
    acceptedAnswers: q.acceptedAnswers || []
  }));

  return {
    title: data.title || (isRandomRequest ? 'AIおまかせ英作文セット' : (topicPrompt || '')),
    questions
  };
}

/**
 * Evaluate user's oral blitz speech transcript against the prompt and target answer using Gemini
 */
export async function evaluateBlitzSpeech({
  apiKey,
  model,
  prompt,
  standardAnswer,
  acceptedAnswers = [],
  grammarPoint = '',
  userSpeech
}: EvaluateBlitzSpeechOptions): Promise<BlitzSpeechEvaluationResult> {
  if (!apiKey) throw new Error("Gemini APIキーを設定してください。");
  if (!userSpeech || !userSpeech.trim()) {
    throw new Error("ユーザーの発話内容がありません。");
  }

  const systemPrompt = `
You are an expert bilingual English Conversation Coach specializing in Instant Oral Translation (瞬間英作文) and Pattern Practice.
The user was given a Japanese prompt sentence and attempted to speak the English translation instantly.
Analyze the user's spoken English transcript against the Japanese prompt, standard answer, accepted variations, and target grammar point.

JAPANESE PROMPT: "${prompt}"
STANDARD ANSWER: "${standardAnswer}"
ACCEPTED ALTERNATIVES: ${JSON.stringify(acceptedAnswers)}
TARGET GRAMMAR POINT: "${grammarPoint}"
USER'S SPOKEN TRANSCRIPT: "${userSpeech}"

EVALUATION PHILOSOPHY:
- Prioritize COMMUNICATIVE INTENT and NATURALNESS over strict word-for-word matching.
- If the user expressed the meaning accurately with appropriate grammar (even using different words/structure than the standard answer), consider it PASS/CORRECT.
- Minor slips (e.g. slight article error like 'a' vs 'the', or minor preposition hesitation) that still clearly convey meaning can be rated as "ACCEPTABLE" with minor feedback.
- If the grammar breaks down, meaning is distorted, or key elements are missing, rate as "NEEDS_WORK".

RETURN STRUCTURE:
1. "isCorrect": boolean (true for PERFECT and ACCEPTABLE, false for NEEDS_WORK)
2. "status": "PERFECT" | "ACCEPTABLE" | "NEEDS_WORK"
3. "statusLabelJa": "🎉 完璧！" | "👍 通じる！（惜しい）" | "💪 要復習"
4. "score": number (0 to 100)
5. "evaluationJa": Supportive and constructive feedback in Japanese explaining what was good and what can be improved (1-2 sentences).
6. "improvedSpeech": A polished, natural version based on what the user said (or the best phrasing).
7. "grammarAdviceJa": Brief point regarding the target grammar or vocabulary usage in Japanese (1 sentence, optional).

Return strictly JSON matching this structure:
{
  "isCorrect": true,
  "status": "PERFECT",
  "statusLabelJa": "🎉 完璧！",
  "score": 95,
  "evaluationJa": "日本語での講評",
  "improvedSpeech": "Polished English version",
  "grammarAdviceJa": "文法や表現のアドバイス"
}
`;

  const contents = [
    { role: 'user' as const, parts: [{ text: `Evaluate this spoken English: "${userSpeech}" for prompt: "${prompt}".` }] }
  ];

  const schema = {
    type: "OBJECT",
    properties: {
      isCorrect: { type: "BOOLEAN" },
      status: { type: "STRING" },
      statusLabelJa: { type: "STRING" },
      score: { type: "INTEGER" },
      evaluationJa: { type: "STRING" },
      improvedSpeech: { type: "STRING" },
      grammarAdviceJa: { type: "STRING" }
    },
    required: ["isCorrect", "status", "statusLabelJa", "score", "evaluationJa", "improvedSpeech"]
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  return cleanAndParseJson<BlitzSpeechEvaluationResult>(rawJson);
}
