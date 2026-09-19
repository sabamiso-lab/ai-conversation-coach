import { useState, useCallback } from 'react';
import { askConversationCoach } from '../services/gemini';
import { 
  Situation, 
  ChatMessage, 
  CoachMessage, 
  CoachMode, 
  CoachShadowingContext, 
  CoachBlitzContext,
  CoachConversationContext
} from '../types';

interface UseConversationCoachOptions {
  apiKey: string;
  model: string;
  mode?: CoachMode;
  situation?: Situation | null;
  messages?: ChatMessage[];
  conversationContext?: CoachConversationContext | null;
  shadowingContext?: CoachShadowingContext | null;
  blitzContext?: CoachBlitzContext | null;
}

export function useConversationCoach({
  apiKey,
  model,
  mode = 'conversation',
  situation,
  messages = [],
  conversationContext,
  shadowingContext,
  blitzContext
}: UseConversationCoachOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');

  // Initial greeting message based on mode & context
  const createGreeting = useCallback((): CoachMessage => {
    if (mode === 'shadowing' || shadowingContext) {
      const title = shadowingContext?.title || 'シャドーイング特訓';
      return {
        id: 'coach-init',
        role: 'assistant',
        text: `こんにちは！シャドーイング専属AIコーチです🎧\n現在「${title}」の英文スクリプトを把握しています。\n\n「リエゾン・脱落など発音のコツは？」「この文の構文・意味は？」「リズムよく発話するには？」など、何でも日本語で気軽に相談してください！`,
        timestamp: 0
      };
    }
    if (mode === 'blitz' || blitzContext) {
      const topic = blitzContext?.topicTitle || '瞬間英作文';
      const qText = blitzContext?.currentQuestion ? `\n現在のお題: 「${blitzContext.currentQuestion.japanese}」` : '';
      return {
        id: 'coach-init',
        role: 'assistant',
        text: `こんにちは！瞬間英作文AIコーチです⚡\n「${topic}」のトレーニングをサポートします。${qText}\n\n「なぜこの語順になる？」「別の自然な言い方は？」「パターンの定着のコツは？」など、何でも日本語で気軽に質問してください！`,
        timestamp: 0
      };
    }
    if (situation) {
      return {
        id: 'coach-init',
        role: 'assistant',
        text: `こんにちは！バイリンガルAIコーチです👋\n現在進行中の「${situation.titleJa || situation.title}」の会話ログを把握しています。\n\n「相手の発言のニュアンスは？」「ここで何て返せばいい？」「この場面のマナーは？」など、何でも日本語で気軽に質問してください！`,
        timestamp: 0
      };
    }
    return {
      id: 'coach-init',
      role: 'assistant',
      text: `こんにちは！バイリンガルAIコーチです👋\n気になる英会話の表現やトピック選び、学習法など、何でも日本語で気軽に質問してください！`,
      timestamp: 0
    };
  }, [mode, shadowingContext, blitzContext, situation]);

  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(() => [createGreeting()]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    setCoachMessages([createGreeting()]);
    setError(null);
  }, [createGreeting]);

  const askQuestion = useCallback(async (customQuestion?: string) => {
    const q = (customQuestion || questionInput).trim();
    if (!q || isLoading) return;

    if (!apiKey) {
      setError("Gemini API Key が設定されていません。右上の [API Key 設定] から登録してください。");
      return;
    }

    const userMsg: CoachMessage = {
      id: `user-coach-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: Date.now()
    };

    setCoachMessages(prev => [...prev, userMsg]);
    setQuestionInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await askConversationCoach({
        apiKey,
        model,
        mode,
        situation,
        history: messages,
        conversationContext,
        shadowingContext,
        blitzContext,
        question: q,
        coachHistory: coachMessages
      });

      const assistantMsg: CoachMessage = {
        id: `coach-${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        suggestedPhrases: response.suggestedPhrases,
        timestamp: Date.now()
      };

      setCoachMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error("Coach QA error:", err);
      const msg = err instanceof Error ? err.message : "AIコーチからの回答取得に失敗しました。";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [questionInput, isLoading, apiKey, model, mode, situation, messages, conversationContext, shadowingContext, blitzContext, coachMessages]);

  return {
    isOpen,
    setIsOpen,
    toggleOpen,
    coachMessages,
    isLoading,
    error,
    questionInput,
    setQuestionInput,
    askQuestion,
    clearHistory
  };
}
