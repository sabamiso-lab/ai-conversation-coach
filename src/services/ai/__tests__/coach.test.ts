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

  it('includes latest AI utterance as key context in conversation prompt', async () => {
    const mockApiResponse = JSON.stringify({
      answer: 'サイズを聞かれています。「Medium please」のように答えましょう。',
      suggestedPhrases: [
        { english: 'Medium, please.', japanese: 'Mサイズでお願いします。' }
      ]
    });

    vi.mocked(clientModule.callGeminiApi).mockResolvedValue(mockApiResponse);

    await askConversationCoach({
      apiKey: 'test-key',
      situation: mockSituation,
      history: [
        { id: '1', role: 'ai', text: 'What can I get started for you today?' },
        { id: '2', role: 'user', text: 'Can I have an iced coffee?' },
        { id: '3', role: 'ai', text: 'Sure! What size would you like?' }
      ],
      question: '何を聞かれていますか？'
    });

    expect(clientModule.callGeminiApi).toHaveBeenCalledWith(
      'test-key',
      undefined,
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          parts: expect.arrayContaining([
            expect.objectContaining({
              text: expect.stringContaining('★最重要★【直前の相手（Friendly Barista）の最新発言】:\n"Sure! What size would you like?"')
            })
          ])
        })
      ]),
      expect.anything()
    );
  });

  it('includes live user waiting status and typing input in conversation prompt', async () => {
    vi.mocked(clientModule.callGeminiApi).mockResolvedValue(JSON.stringify({
      answer: 'ラージと答えたい場合は「Large, please」で通じます。',
      suggestedPhrases: []
    }));

    await askConversationCoach({
      apiKey: 'test-key',
      situation: mockSituation,
      history: [
        { id: '1', role: 'ai', text: 'What size would you like?' }
      ],
      conversationContext: {
        currentUserInput: 'large one'
      },
      question: 'これで合ってますか？'
    });

    expect(clientModule.callGeminiApi).toHaveBeenCalledWith(
      'test-key',
      undefined,
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          parts: expect.arrayContaining([
            expect.objectContaining({
              text: expect.stringContaining('★ユーザーの現在の回答ステータス★: 【未回答（まだ返答していません）】')
            }),
            expect.objectContaining({
              text: expect.stringContaining('現在ユーザーが入力欄に打ちかけの未送信テキスト: 「large one」')
            })
          ])
        })
      ]),
      expect.anything()
    );
  });

  it('includes user speech and evaluation status in blitz mode prompt', async () => {
    vi.mocked(clientModule.callGeminiApi).mockResolvedValue(JSON.stringify({
      answer: 'open the window と冠詞 the を補うとより自然です。',
      suggestedPhrases: []
    }));

    await askConversationCoach({
      apiKey: 'test-key',
      mode: 'blitz',
      blitzContext: {
        topicTitle: '日常依頼',
        currentIndex: 2,
        totalQuestions: 10,
        currentQuestion: {
          japanese: '窓を開けていただけますか？',
          sampleAnswer: 'Could you open the window?'
        },
        userSpeech: 'Could you open window?',
        isCorrect: false,
        aiEvaluation: {
          feedbackJa: 'window の前に the が必要です'
        }
      },
      question: '何が間違っていましたか？'
    });

    expect(clientModule.callGeminiApi).toHaveBeenCalledWith(
      'test-key',
      undefined,
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          parts: expect.arrayContaining([
            expect.objectContaining({
              text: expect.stringContaining('トピック: 日常依頼 （第 3 問 / 全 10 問）')
            }),
            expect.objectContaining({
              text: expect.stringContaining('ユーザーの回答音声テキスト: "Could you open window?"')
            }),
            expect.objectContaining({
              text: expect.stringContaining('正誤判定: 【惜しい・不正解】')
            })
          ])
        })
      ]),
      expect.anything()
    );
  });
});

