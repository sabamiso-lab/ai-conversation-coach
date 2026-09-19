import { useState, useCallback } from 'react';
import { askConversationCoach } from '../services/gemini';
import { Situation, ChatMessage, CoachMessage } from '../types';

interface UseConversationCoachOptions {
  apiKey: string;
  model: string;
  situation?: Situation | null;
  messages?: ChatMessage[];
}

export function useConversationCoach({
  apiKey,
  model,
  situation,
  messages = []
}: UseConversationCoachOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');

  // Initial greeting message based on situation
  const createGreeting = useCallback((): CoachMessage => {
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
      text: `こんにちは！バイリンガルAIコーチです👋\n英会話のシチュエーションを選択して会話をスタートすると、会話内容に応じたリアルタイム相談ができます。\n\n「初心者におすすめのトピックは？」「海外旅行でまず覚えるべきフレーズは？」など、気になることがあれば何でも日本語で質問してください！`,
      timestamp: 0
    };
  }, [situation]);

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
        situation,
        history: messages,
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
  }, [questionInput, isLoading, apiKey, model, situation, messages, coachMessages]);

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
