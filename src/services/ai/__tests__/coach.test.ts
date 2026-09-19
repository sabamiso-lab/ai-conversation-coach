import { describe, expect, it, vi, beforeEach } from 'vitest';
import { askConversationCoach } from '../coach';
import * as clientModule from '../client';

vi.mock('../client', () => ({
  callGeminiApi: vi.fn(),
  DEFAULT_MODEL: 'gemini-3.5-flash-lite'
}));

describe('askConversationCoach', () => {
  const mockSituation = {
    id: 'cafe-order',
    title: 'Cafe Coffee Order',
    titleJa: 'カフェでの注文',
    category: 'Daily',
    systemRole: 'Friendly Barista',
    userRole: 'Customer',
    descriptionJa: 'コーヒーを注文します。',
    initialMessage: 'What can I get started for you today?',
    goals: ['Order coffee']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws an error when apiKey is missing', async () => {
    await expect(
      askConversationCoach({
        apiKey: '',
        situation: mockSituation,
        history: [],
        question: 'どう答えればいい？'
      })
    ).rejects.toThrow('Gemini API key is required');
  });

  it('returns parsed answer and suggested phrases on successful response', async () => {
    const mockApiResponse = JSON.stringify({
      answer: '店員さんは注文を尋ねています。「I would like a latte」のように答えると自然です。',
      suggestedPhrases: [
        { english: 'Could I get a latte, please?', japanese: 'ラテを1つお願いできますか？' },
        { english: 'Just a regular coffee, please.', japanese: 'ホットコーヒーを1つください。' }
      ]
    });

    vi.mocked(clientModule.callGeminiApi).mockResolvedValue(mockApiResponse);

    const result = await askConversationCoach({
      apiKey: 'test-key',
      situation: mockSituation,
      history: [
        { id: '1', role: 'ai', text: 'What can I get started for you today?' }
      ],
      question: '何て答えればいいですか？'
    });

    expect(result.answer).toContain('店員さんは注文を尋ねています');
    expect(result.suggestedPhrases).toHaveLength(2);
    expect(result.suggestedPhrases[0].english).toBe('Could I get a latte, please?');
    expect(result.suggestedPhrases[0].japanese).toBe('ラテを1つお願いできますか？');
  });

  it('handles empty suggestedPhrases gracefully', async () => {
    const mockApiResponse = JSON.stringify({
      answer: 'この場面ではチップは通常カウンターでのお会計時には不要です。',
      suggestedPhrases: []
    });

    vi.mocked(clientModule.callGeminiApi).mockResolvedValue(mockApiResponse);

    const result = await askConversationCoach({
      apiKey: 'test-key',
      situation: mockSituation,
      history: [],
      question: 'チップは払う必要がありますか？'
    });

    expect(result.answer).toContain('チップは通常カウンターでのお会計時には不要');
    expect(result.suggestedPhrases).toEqual([]);
  });

  it('falls back when raw response is not valid JSON', async () => {
    vi.mocked(clientModule.callGeminiApi).mockResolvedValue('Plain text response without JSON');

    const result = await askConversationCoach({
      apiKey: 'test-key',
      situation: mockSituation,
      history: [],
      question: '質問です'
    });

    expect(result.answer).toBe('Plain text response without JSON');
    expect(result.suggestedPhrases).toEqual([]);
  });

  it('handles shadowing mode with shadowing context', async () => {
    const mockApiResponse = JSON.stringify({
      answer: '「check in」は音が連結して「チェッキン」のように発音されます。',
      suggestedPhrases: [
        { english: 'check in', japanese: 'チェックインする' }
      ]
    });

    vi.mocked(clientModule.callGeminiApi).mockResolvedValue(mockApiResponse);

    const result = await askConversationCoach({
      apiKey: 'test-key',
      mode: 'shadowing',
      shadowingContext: {
        title: 'Airport Check-in',
        category: 'Travel',
        fullText: 'I would like to check in for my flight.'
      },
      question: 'check in のリエゾンのコツを教えてください'
    });

    expect(result.answer).toContain('チェッキン');
    expect(result.suggestedPhrases).toHaveLength(1);
    expect(clientModule.callGeminiApi).toHaveBeenCalledWith(
      'test-key',
      undefined,
      expect.stringContaining('Shadowing Practice'),
      expect.anything(),
      expect.anything()
    );
  });

  it('handles blitz mode with blitz context', async () => {
    const mockApiResponse = JSON.stringify({
      answer: '「Could you」を使うことで丁寧にお願いする表現になります。',
      suggestedPhrases: [
        { english: 'Could you help me?', japanese: '手伝っていただけますか？' }
      ]
    });

    vi.mocked(clientModule.callGeminiApi).mockResolvedValue(mockApiResponse);

    const result = await askConversationCoach({
      apiKey: 'test-key',
      mode: 'blitz',
      blitzContext: {
        topicTitle: '丁寧な依頼',
        currentQuestion: {
          japanese: '手伝っていただけますか？',
          sampleAnswer: 'Could you help me?',
          keyPoints: ['Could you + 動詞の原形']
        }
      },
      question: '別の言い方はありますか？'
    });

    expect(result.answer).toContain('Could you');
    expect(clientModule.callGeminiApi).toHaveBeenCalledWith(
      'test-key',
      undefined,
      expect.stringContaining('Instant Oral Blitz'),
      expect.anything(),
      expect.anything()
    );
  });
});
