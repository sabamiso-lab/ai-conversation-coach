import { SITUATIONS } from '../data/situations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY || 'sf_secret_key_speakflow_2026';

/**
 * Fetch list of roleplay situations from AWS DynamoDB API.
 * Automatically falls back to local SITUATIONS array if offline, API not set, or error occurs.
 */
export async function fetchSituations() {
  if (!API_BASE_URL) {
    console.info('ℹ️ VITE_API_BASE_URL not configured. Using local fallback situations.');
    return { data: SITUATIONS, isFallback: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-speakflow-api-key': API_KEY,
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
    const formattedSituations = fetchedSituations.map((item) => ({
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
      goals: Array.isArray(item.goals)
        ? item.goals
        : item.goals instanceof Set
        ? Array.from(item.goals)
        : item.goals?.SS && Array.isArray(item.goals.SS)
        ? item.goals.SS
        : item.goals && typeof item.goals === 'object'
        ? Object.values(item.goals).flat()
        : [],
    }));

    return { data: formattedSituations, isFallback: false };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('⚠️ Failed to fetch situations from API. Using local fallback.', error.message);
    return { data: SITUATIONS, isFallback: true, error: error.message };
  }
}
