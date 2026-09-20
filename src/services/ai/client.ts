import { cleanAndParseJson } from '../../utils/jsonRepair';

export const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContent {
  role?: 'user' | 'model';
  parts: GeminiContentPart[];
}

export interface GeminiGroundingMetadata {
  webSearchQueries?: string[];
  searchEntryPoint?: { renderedContent: string };
  groundingChunks?: Array<{ web?: { uri: string; title: string } }>;
  groundingSupports?: Array<unknown>;
}

export interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiContentPart[];
    };
    groundingMetadata?: GeminiGroundingMetadata;
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

/**
 * Call Gemini API endpoint
 */
export async function callGeminiApi(
  apiKey: string,
  model: string | undefined,
  systemInstruction: string,
  contents: GeminiContent[],
  responseSchema: object | null = null
): Promise<string> {
  const modelName = model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload: {
    contents: GeminiContent[];
    systemInstruction: { parts: GeminiContentPart[] };
    generationConfig: {
      temperature: number;
      maxOutputTokens: number;
      responseMimeType?: string;
      responseSchema?: object;
    };
  } = {
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
    const errorData: GeminiApiResponse = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data: GeminiApiResponse = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("No response received from Gemini API.");
  }

  return textResponse;
}

/**
 * Call Gemini API with Google Search Grounding enabled
 */
export async function callGeminiApiWithGrounding(
  apiKey: string,
  model: string | undefined,
  prompt: string
): Promise<{ text: string; groundingMetadata: GeminiGroundingMetadata | null }> {
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
    const errorData: GeminiApiResponse = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data: GeminiApiResponse = await response.json();
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
 * Call Gemini API with JSON Schema and automatically repair/parse JSON response
 */
export async function callGeminiJson<T>(
  apiKey: string,
  model: string | undefined,
  systemInstruction: string,
  contents: GeminiContent[],
  responseSchema?: object | null
): Promise<T> {
  if (!apiKey) {
    throw new Error("Gemini APIキーを設定してください。");
  }

  const rawJson = await callGeminiApi(
    apiKey,
    model,
    systemInstruction,
    contents,
    responseSchema || null
  );

  return cleanAndParseJson<T>(rawJson);
}

