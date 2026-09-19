import { callGeminiApi } from './client';
import { cleanAndParseJson } from '../../utils/jsonRepair';

/**
 * Generate Instant Oral Translation (瞬間英作文) questions using Gemini
 */
export async function generateBlitzQuestions({ apiKey, model, topicPrompt, difficulty = 'Intermediate', count = 10 }) {
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
    { role: 'user', parts: [{ text: userPromptText }] }
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

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  const data = cleanAndParseJson(rawJson);

  const questions = (data.questions || []).map((q, idx) => ({
    ...q,
    id: q.id || `gen-${Date.now()}-${idx}`,
    acceptedAnswers: q.acceptedAnswers || []
  }));

  return {
    title: data.title || (isRandomRequest ? 'AIおまかせ英作文セット' : topicPrompt),
    questions
  };
}
