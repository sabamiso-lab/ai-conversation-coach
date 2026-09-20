import { callGeminiApi, callGeminiApiWithGrounding } from './client';
import { cleanAndParseJson } from '../../utils/jsonRepair';
import { Situation } from '../../types';

export interface GenerateNewsOptions {
  apiKey: string;
  model?: string;
  category?: string;
  topic?: string;
  difficulty?: string;
  onProgressStatus?: (status: string) => void;
}

/**
 * Generate a dynamic English conversation scenario based on real-time news using Google Search Grounding
 */
export async function generateNewsSituation({
  apiKey,
  model,
  category = 'Technology',
  topic = '',
  difficulty = 'Intermediate',
  onProgressStatus = () => {}
}: GenerateNewsOptions): Promise<Situation> {
  if (!apiKey) throw new Error("Gemini APIキーを設定してください。");

  const searchTarget = topic.trim() ? `topic: "${topic.trim()}" (Category: ${category})` : `category: "${category}"`;

  // Step 1: Grounding Search
  onProgressStatus(`Google検索で${difficulty === 'Beginner' ? '初級者向け' : difficulty === 'Advanced' ? '上級者向け' : '最新'}のニュース（${topic.trim() || category}）を検索・収集しています...`);

  const groundingPrompt = `
Search for 1 recent, compelling news story published today or in the last few days for ${searchTarget}.
Topics can include technology, business, international relations, climate, sports, entertainment, or science.

Target English Difficulty Level for English Learners: ${difficulty}

Requirements:
1. Provide a clear summary in English (3-4 sentences).
${difficulty === 'Beginner' ? '   - Use simple, straightforward words suitable for basic English learners.' : ''}
${difficulty === 'Advanced' ? '   - Highlight detailed facts, key statistics, and deeper background context.' : ''}
2. Provide a clear Japanese summary (3-4 sentences).
3. State the main headline and key details accurately based on real Google search results.
`;

  const groundingResult = await callGeminiApiWithGrounding(apiKey, model, groundingPrompt);
  const newsText = groundingResult.text;
  const metadata = groundingResult.groundingMetadata;

  // Extract top news article title and URL from groundingMetadata
  let sourceTitle: string | null = null;
  let sourceUrl: string | null = null;

  if (metadata && Array.isArray(metadata.groundingChunks)) {
    for (const chunk of metadata.groundingChunks) {
      if (chunk.web && chunk.web.uri) {
        sourceUrl = chunk.web.uri;
        sourceTitle = chunk.web.title || `${category} News Article`;
        break;
      }
    }
  }

  // Step 2: Structuring Scenario
  onProgressStatus('最新ニュースを英会話ロールプレイのシチュエーションに変換中...');

  // Truncate newsText to avoid prompt overload and token exhaustion
  const truncatedNewsText = newsText && newsText.length > 1500 ? newsText.slice(0, 1500) + '...' : newsText;

  const structPrompt = `
You are an expert English Language Coach creating a scenario tailored for a **${difficulty}** level English learner.
Convert the following real news story into an engaging, interactive English conversation roleplay scenario:

NEWS CONTENT (Retrieved via Google Search):
${truncatedNewsText}

Category: ${category}
Target Difficulty Level: ${difficulty}

DIFFICULTY LEVEL GUIDELINES:
- **Beginner**:
  * English Title & Description: Use basic, everyday vocabulary and short simple sentences (2-3 sentences max).
  * System Role & User Role: Friendly, accessible conversation setting (e.g. sharing news with a friend).
  * Initial Message: Very friendly, short (1-2 sentences), using basic English (e.g. "Did you hear about...? It sounds cool!").
  * Goals: Simple, easy-to-achieve goals (e.g., "Goal 1: Say if you like this news", "Goal 2: Mention one reason why").
- **Intermediate**:
  * English Title & Description: Standard news English (B1-B2 vocabulary, 2-3 sentences max).
  * System Role & User Role: Practical colleague or friend discussing current affairs.
  * Initial Message: Engaging 2-3 sentence overview and question.
  * Goals: Share opinions, explain impact, ask follow-up questions.
- **Advanced**:
  * English Title & Description: Sophisticated, business/professional level English (C1-C2 vocabulary, 2-3 sentences max).
  * System Role & User Role: Expert colleague, analyst, or journalist debating implications.
  * Initial Message: Thought-provoking 2-3 sentence statement introducing strategic or societal nuances.
  * Goals: Debate pros/cons, evaluate long-term market/societal impacts, discuss trade-offs.

IMPORTANT: Keep description and descriptionJa concise (2-3 sentences max).

Adhere strictly to this JSON schema:
{
  "title": "Short punchy English title summarizing the scenario",
  "titleJa": "日本語タイトルの和訳",
  "category": "News & Trends",
  "icon": "Globe",
  "difficulty": "${difficulty}",
  "systemRole": "In-character role suited for ${difficulty} level",
  "userRole": "In-character user role suited for ${difficulty} level",
  "description": "Clear English summary suited for ${difficulty} level",
  "descriptionJa": "どのようなニュースについての会話か日本語での分かりやすい解説",
  "initialMessage": "Opening question/statement in English from AI partner matching ${difficulty} level",
  "initialMessageJa": "AIパートナーの初期メッセージ（initialMessage）に対する自然な日本語訳",
  "goals": [
    "Goal 1 matching ${difficulty} level",
    "Goal 2 matching ${difficulty} level",
    "Goal 3 matching ${difficulty} level"
  ]
}
`;

  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      titleJa: { type: "STRING" },
      category: { type: "STRING" },
      icon: { type: "STRING" },
      difficulty: { type: "STRING" },
      systemRole: { type: "STRING" },
      userRole: { type: "STRING" },
      description: { type: "STRING" },
      descriptionJa: { type: "STRING" },
      initialMessage: { type: "STRING" },
      initialMessageJa: { type: "STRING" },
      goals: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["title", "titleJa", "category", "icon", "difficulty", "systemRole", "userRole", "description", "descriptionJa", "initialMessage", "initialMessageJa", "goals"]
  };

  const rawJson = await callGeminiApi(apiKey, model, structPrompt, [
    { role: 'user', parts: [{ text: structPrompt }] }
  ], schema);

  interface RawNewsScenario {
    title: string;
    titleJa: string;
    category: string;
    icon?: string;
    difficulty?: string;
    systemRole: string;
    userRole?: string;
    description?: string;
    descriptionJa: string;
    initialMessage: string;
    initialMessageJa?: string;
    goals: string[];
  }

  const scenarioData = cleanAndParseJson<RawNewsScenario>(rawJson);

  // Calculate Unix timestamp for tomorrow 00:00:00 in seconds (midnight of next day)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const expiresAt = Math.floor(tomorrow.getTime() / 1000);

  return {
    ...scenarioData,
    difficulty: difficulty, // Ensure difficulty is explicitly set
    id: `news-${Date.now()}`,
    isNews: true,
    expiresAt: expiresAt,
    newsCategory: category,
    newsSource: sourceUrl ? {
      title: sourceTitle || 'Google Search News Result',
      url: sourceUrl
    } : undefined
  };
}
