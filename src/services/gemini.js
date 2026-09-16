/**
 * Service module for interacting with Google Gemini API (gemini-3.5-flash-lite)
 */

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

/**
 * Fix unescaped control characters (like raw linebreaks) inside JSON strings
 */
function sanitizeControlChars(str) {
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
function autoCloseJson(str) {
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
    // Attempt 2: Sanitize control characters (raw newlines in strings)
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

function cleanAndParseJson(rawJson) {
  if (!rawJson) throw new Error("Empty response from API");

  try {
    return repairJson(rawJson);
  } catch (err) {
    console.error("JSON Parse Error. Raw string length:", rawJson.length, "Raw string snippet:", rawJson.slice(0, 300));
    throw new Error(`JSON parsing failed: ${err.message}. The response may have been cut off or formatted incorrectly.`);
  }
}

/**
 * Call Gemini API endpoint
 */
async function callGeminiApi(apiKey, model, systemInstruction, contents, responseSchema = null) {
  const modelName = model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  };

  if (responseSchema) {
    payload.generationConfig.responseMimeType = 'application/json';
    payload.generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("No response received from Gemini API.");
  }

  return textResponse;
}

/**
 * Send a chat turn to Gemini and receive roleplay response + user feedback
 */
export async function sendChatMessage({ apiKey, model, situation, history, userText }) {
  if (!apiKey) {
    throw new Error("Gemini API key is required. Please set your API key in settings.");
  }

  const systemPrompt = `
You are acting as an English conversation tutor helping the user master practical, real-world English for living abroad.
Scenario Title: ${situation.title}
Target Difficulty Level: ${situation.difficulty || 'Intermediate'}
Your Persona / Role: ${situation.systemRole}
User Role: ${situation.userRole}
Scenario Context: ${situation.description}

DIFFICULTY LEVEL RESPONSE GUIDELINE:
- Beginner Level: Use clear, simple, short English sentences (1-2 sentences). Use basic everyday words (A1-A2). Avoid complex grammar or idiom overload.
- Intermediate Level: Use natural, standard practical English (2-3 sentences) suitable for everyday and business communication.
- Advanced Level: Use native-level, rich vocabulary, nuanced expressions, and thought-provoking questions (2-3 sentences).

EVALUATION PHILOSOPHY:
Prioritize COMMUNICATIVE INTENT and MEANING CLARITY over perfect grammar or sophisticated vocabulary.
Even if the user makes grammatical errors, if their core message would be clearly understood by a local native speaker in real life, judge it as "FULL" (100% 意図が伝わった!).
Always provide reassuring, positive feedback in Japanese so the user gains confidence in speaking!

YOUR MISSION:
1. Stay strictly in character as "${situation.systemRole}" and respond naturally in English according to the Target Difficulty Level.
2. Analyze the user's statement ("${userText}") for communicative intent:
   - clarityStatus: "FULL" (100%意図が伝わった), "PARTIAL" (おおむね伝わった), or "UNCLEAR" (伝わりづらい)
   - clarityBadgeJa: e.g. "🟢 100% 意図が伝わった！", "🟡 おおむね伝わった", "🔴 伝わりづらい"
   - clarityFeedbackJa: Encouraging Japanese feedback explaining how their intent reached the listener (e.g. "多少の文法ミスはありますが、『お湯が出なくて困っている』という核心の意思は100%相手に伝わっています！").
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
  "simpleAlternative": "もっと簡単に伝えるサバイバル英語フレーズ",
  "betterPhrasing": "より自然な英語表現（任意、またはnull）",
  "phrasingTip": "ワンポイント解説（日本語、任意）"
}
`;

  // Format conversation history for Gemini API
  const contents = [];
  
  // Add initial message if history is empty
  if (history.length === 0 && situation.initialMessage) {
    contents.push({
      role: 'model',
      parts: [{ text: situation.initialMessage }]
    });
  }

  history.forEach(item => {
    contents.push({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    });
  });

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userText }]
  });

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
  return cleanAndParseJson(rawJson);
}

/**
 * Generate 3 hint options for what the user can say next
 */
export async function getHintSuggestions({ apiKey, model, situation, history }) {
  if (!apiKey) throw new Error("API Key required");

  const systemPrompt = `
You are a helpful English conversation coach. The user is participating in this scenario:
Scenario: ${situation.title} (${situation.userRole})

Based on the conversation history so far, generate 3 different practical ideas/sentences the user could say next to keep the conversation going or fulfill their scenario goals (${situation.goals.join(', ')}).

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

  const contents = [
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
  return cleanAndParseJson(rawJson);
}

/**
 * Generate comprehensive post-session evaluation report
 */
export async function generateSessionReport({ apiKey, model, situation, history }) {
  if (!apiKey) throw new Error("API Key required");

  const systemPrompt = `
You are an expert English Language Coach focused on REAL-WORLD SURVIVAL ENGLISH FOR LIVING ABROAD.
Evaluate the user's performance in this conversation roleplay based on COMMUNICATIVE SUCCESS and MEANING CLARITY.
Scenario: ${situation.title}
Target Goals: ${situation.goals.join(', ')}

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

  const contents = [
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
  return cleanAndParseJson(rawJson);
}

/**
 * Call Gemini API with Google Search Grounding enabled
 */
async function callGeminiApiWithGrounding(apiKey, model, prompt) {
  const modelName = model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    tools: [
      { googleSearch: {} }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const textResponse = candidate?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error("No response received from Gemini API with Grounding.");
  }

  return {
    text: textResponse,
    groundingMetadata: candidate?.groundingMetadata || null
  };
}

/**
 * Generate a dynamic English conversation scenario based on real-time news using Google Search Grounding
 */
export async function generateNewsSituation({ apiKey, model, category = 'Technology', difficulty = 'Intermediate', onProgressStatus = () => {} }) {
  if (!apiKey) throw new Error("Gemini APIキーを設定してください。");

  // Step 1: Grounding Search
  onProgressStatus(`Google検索で${difficulty === 'Beginner' ? '初級者向け' : difficulty === 'Advanced' ? '上級者向け' : '最新'}のニュースを検索・収集しています...`);

  const groundingPrompt = `
Search for 1 recent, compelling news story published today or in the last few days in the category: "${category}".
Topics can include technology, business, international relations, climate, entertainment, or science.

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
  let sourceTitle = null;
  let sourceUrl = null;

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

  const scenarioData = cleanAndParseJson(rawJson);

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
      title: sourceTitle || `${category} News Article`,
      url: sourceUrl
    } : null
  };
}

