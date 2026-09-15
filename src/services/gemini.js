/**
 * Service module for interacting with Google Gemini API (gemini-3.5-flash-lite)
 */

const DEFAULT_MODEL = 'gemini-1.5-flash';

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
      maxOutputTokens: 1024
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
You are acting as an English conversation tutor in a roleplay scenario.
Scenario Title: ${situation.title}
Your Persona / Role: ${situation.systemRole}
User Role: ${situation.userRole}
Scenario Context: ${situation.description}

YOUR MISSION:
1. Stay strictly in character as "${situation.systemRole}" and respond naturally in English to the user's latest statement. Keep your response conversational, concise (1-3 sentences), and encouraging.
2. Analyze the user's latest statement ("${userText}") for grammar, naturalness, and vocabulary.
   - If the user made grammatical mistakes or expressed it unnaturally, provide a "betterPhrasing" suggestion in natural native English.
   - If the user's expression was already natural, you can set "betterPhrasing" to null.
3. Provide Japanese translations for BOTH the user's input and your AI response.

Return your response strictly as JSON with this structure:
{
  "aiResponseText": "Your in-character English response here",
  "aiResponseTranslation": "AIレスポンスの自然な日本語訳",
  "userTextTranslation": "ユーザーの発言の日本語訳",
  "betterPhrasing": "より自然な英語表現の提案（すでに自然な場合はnull）",
  "phrasingTip": "表現の工夫やアドバイスの簡単な説明（日本語、必要に応じて）"
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
      betterPhrasing: { type: "STRING", nullable: true },
      phrasingTip: { type: "STRING", nullable: true }
    },
    required: ["aiResponseText", "aiResponseTranslation", "userTextTranslation"]
  };

  const rawJson = await callGeminiApi(apiKey, model, systemPrompt, contents, schema);
  return JSON.parse(rawJson);
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
  return JSON.parse(rawJson);
}

/**
 * Generate comprehensive post-session evaluation report
 */
export async function generateSessionReport({ apiKey, model, situation, history }) {
  if (!apiKey) throw new Error("API Key required");

  const systemPrompt = `
You are an expert English Language Assessor. Evaluate the user's performance in this conversation roleplay.
Scenario: ${situation.title}
Target Goals: ${situation.goals.join(', ')}

Analyze all user inputs in the conversation history for:
1. Grammar Accuracy (0-100 score)
2. Vocabulary Richness (0-100 score)
3. Communication & Goal Achievement (0-100 score)

Provide:
- Overall Score (0-100)
- Detailed Feedback in Japanese (Strengths, Areas for Improvement)
- Key Phrases Learned (3-5 phrases with English & Japanese)
- Scenario Goals Achievement status (which goals were completed)

Return strictly JSON matching this structure:
{
  "overallScore": 85,
  "grammarScore": 80,
  "vocabScore": 88,
  "fluencyScore": 85,
  "summaryJa": "全体の講評テキスト（日本語で優しく具体的にアドバイス）",
  "strengthsJa": ["良かった点1", "良かった点2"],
  "improvementsJa": ["改善点1", "改善点2"],
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
  return JSON.parse(rawJson);
}
