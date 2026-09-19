import { SITUATIONS } from '../data/situations';
import { Situation } from '../types';

/**
 * Safely parse goals field from various DynamoDB attribute formats
 */
function parseGoals(goals: unknown): string[] {
  if (Array.isArray(goals)) return goals.map(String);
  if (goals instanceof Set) return Array.from(goals).map(String);
  if (goals && typeof goals === 'object' && 'SS' in goals && Array.isArray((goals as { SS: unknown[] }).SS)) {
    return (goals as { SS: unknown[] }).SS.map(String);
  }
  if (goals && typeof goals === 'object') {
    return Object.values(goals).flat().map(String);
  }
  return [];
}

export interface FetchSituationsResult {
  data: Situation[];
  isFallback: boolean;
  error?: string;
}

export interface CreateSituationResult {
  success: boolean;
  situation?: Situation;
  error?: string;
  isFallback?: boolean;
}

/**
 * Fetch list of roleplay situations from AWS DynamoDB API.
 * Automatically falls back to local SITUATIONS array if offline, API not set, or error occurs.
 */
export async function fetchSituations(): Promise<FetchSituationsResult> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiKey = import.meta.env.VITE_API_KEY || 'sf_secret_key_speakflow_2026';

  if (!apiBaseUrl) {
    console.info('ℹ️ VITE_API_BASE_URL not configured. Using local fallback situations.');
    return { data: SITUATIONS, isFallback: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

  try {
    const response = await fetch(apiBaseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-speakflow-api-key': apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const json = await response.json();
    const fetchedSituations = json.situations || [];

    if (fetchedSituations.length === 0) {
      console.warn('⚠️ API returned empty situations list. Using fallback data.');
      return { data: SITUATIONS, isFallback: true };
    }

    // Format DynamoDB data if needed and return
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const formattedSituations: Situation[] = fetchedSituations
      .filter((item: any) => !item.expiresAt || item.expiresAt > nowInSeconds)
      .map((item: any): Situation => ({
        id: item.id,
        title: item.title,
        titleJa: item.titleJa,
        category: item.category,
        icon: item.icon,
        difficulty: item.difficulty,
        systemRole: item.systemRole,
        userRole: item.userRole,
        description: item.description,
        descriptionJa: item.descriptionJa,
        initialMessage: item.initialMessage,
        initialMessageJa: item.initialMessageJa,
        isNews: Boolean(item.isNews),
        expiresAt: item.expiresAt,
        newsCategory: item.newsCategory || null,
        goals: parseGoals(item.goals),
      }));

    return { data: formattedSituations, isFallback: false };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Failed to fetch situations from API. Using local fallback.', errMsg);
    return { data: SITUATIONS, isFallback: true, error: errMsg };
  }
}

/**
 * Register a new situation via AWS DynamoDB API (POST /situations).
 */
export async function createSituation(situationData: Partial<Situation>): Promise<CreateSituationResult> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiKey = import.meta.env.VITE_API_KEY || 'sf_secret_key_speakflow_2026';

  if (!apiBaseUrl) {
    console.info('ℹ️ VITE_API_BASE_URL not configured. Returning local mock success.');
    const mockCreated = {
      ...situationData,
      id: situationData.id || `custom-${Date.now()}`,
      goals: Array.isArray(situationData.goals)
        ? situationData.goals
        : typeof situationData.goals === 'string'
        ? (situationData.goals as string).split('\n').map(g => g.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
        : [],
    } as Situation;
    return { success: true, situation: mockCreated, isFallback: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-speakflow-api-key': apiKey,
      },
      body: JSON.stringify(situationData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${response.status}`);
    }

    const json = await response.json();
    return { success: true, situation: json.situation, isFallback: false };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to register situation:', errMsg);
    return { success: false, error: errMsg };
  }
}
