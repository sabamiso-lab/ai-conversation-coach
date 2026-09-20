import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateNewsSituation } from '../news';
import * as clientModule from '../client';

describe('services/ai/news.ts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when apiKey is missing', async () => {
    await expect(
      generateNewsSituation({ apiKey: '' })
    ).rejects.toThrow('Gemini APIキーを設定してください。');
  });

  it('generates roleplay situation from real-time news with Google Search Grounding', async () => {
    // Mock Grounding Search response
    vi.spyOn(clientModule, 'callGeminiApiWithGrounding').mockResolvedValueOnce({
      text: 'NASA announced a new lunar mission today...',
      groundingMetadata: {
        groundingChunks: [
          { web: { uri: 'https://news.example.com/nasa-moon', title: 'NASA Lunar Mission' } }
        ]
      }
    });

    // Mock Structuring response
    const mockScenario = JSON.stringify({
      title: 'Discussing the New NASA Moon Mission',
      titleJa: 'NASAの新型月探査ミッションについて議論',
      category: 'Science',
      icon: 'Globe',
      difficulty: 'Intermediate',
      systemRole: 'Science Journalist at TechDaily',
      userRole: 'Passionate Astronomy Enthusiast',
      description: 'Discuss the scientific goals and timeline of the new Artemis mission.',
      descriptionJa: 'アルテミス計画の科学的目標やスケジュールについて語り合います。',
      initialMessage: 'Did you see the big announcement from NASA today?',
      initialMessageJa: '今日のNASAの重大発表を見ましたか？',
      goals: ['Express opinion on space exploration', 'Ask about the launch date']
    });

    vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockScenario);

    const onProgress = vi.fn();

    const situation = await generateNewsSituation({
      apiKey: 'test-key',
      category: 'Science',
      topic: 'NASA',
      difficulty: 'Intermediate',
      onProgressStatus: onProgress
    });

    expect(situation.title).toBe('Discussing the New NASA Moon Mission');
    expect(situation.isNews).toBe(true);
    expect(situation.newsSource?.url).toBe('https://news.example.com/nasa-moon');
    expect(situation.goals).toHaveLength(2);
    expect(onProgress).toHaveBeenCalled();
  });
});
