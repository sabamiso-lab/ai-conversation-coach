import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { askConversationCoach } from '../services/gemini';
import { useSettings } from '../hooks/useSettings';
import {
  CoachMode,
  Situation,
  ChatMessage,
  CoachMessage,
  CoachConversationContext,
  CoachShadowingContext,
  CoachBlitzContext
} from '../types';

export interface CoachContextState {
  mode: CoachMode;
  situation: Situation | null;
  conversationHistory: ChatMessage[];
  conversationContext: CoachConversationContext | null;
  shadowingContext: CoachShadowingContext | null;
  blitzContext: CoachBlitzContext | null;
}

export interface CoachContextType extends CoachContextState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  isLoading: boolean;
  error: string | null;
  questionInput: string;
  setQuestionInput: (val: string) => void;
  coachMessages: CoachMessage[];
  askQuestion: (customQuestion?: string) => Promise<void>;
  clearHistory: () => void;
  updateCoachContext: (ctx: Partial<CoachContextState>) => void;
  resetCoachContext: () => void;
}

const defaultContextState: CoachContextState = {
  mode: 'general',
  situation: null,
  conversationHistory: [],
  conversationContext: null,
  shadowingContext: null,
  blitzContext: null
};

function createGreetingMessage(
  mode: CoachMode,
  situation?: Situation | null,
  shadowingContext?: CoachShadowingContext | null,
  blitzContext?: CoachBlitzContext | null
): CoachMessage {
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
    const qText = blitzContext?.currentQuestion ? `\n現在のお題: 「${blitzContext.currentQuestion.japanese || blitzContext.currentQuestion.prompt}」` : '';
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
}

const CoachContext = createContext<CoachContextType | null>(null);

export function CoachProvider({ children }: { children: ReactNode }) {
  const { apiKey, model } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [contextState, setContextState] = useState<CoachContextState>(defaultContextState);

  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(() => [
    createGreetingMessage('general')
  ]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const updateCoachContext = useCallback((updates: Partial<CoachContextState>) => {
    setContextState(prev => {
      const hasModeChanged = updates.mode !== undefined && updates.mode !== prev.mode;
      const hasSituationChanged = updates.situation !== undefined && updates.situation?.id !== prev.situation?.id;
      const hasHistoryChanged = updates.conversationHistory !== undefined && (
        updates.conversationHistory.length !== prev.conversationHistory.length ||
        (updates.conversationHistory.length > 0 && updates.conversationHistory[updates.conversationHistory.length - 1].id !== prev.conversationHistory[prev.conversationHistory.length - 1]?.id)
      );
      const hasContextChanged = updates.conversationContext !== undefined && updates.conversationContext?.currentUserInput !== prev.conversationContext?.currentUserInput;
      const hasShadowingChanged = updates.shadowingContext !== undefined && updates.shadowingContext?.title !== prev.shadowingContext?.title;
      const hasBlitzChanged = updates.blitzContext !== undefined && updates.blitzContext?.topicTitle !== prev.blitzContext?.topicTitle;

      if (!hasModeChanged && !hasSituationChanged && !hasHistoryChanged && !hasContextChanged && !hasShadowingChanged && !hasBlitzChanged) {
        return prev;
      }

      const next = { ...prev, ...updates };
      if (hasModeChanged || hasSituationChanged || hasShadowingChanged || hasBlitzChanged) {
        setCoachMessages(msgs => {
          if (msgs.length <= 1) {
            return [createGreetingMessage(next.mode, next.situation, next.shadowingContext, next.blitzContext)];
          }
          return msgs;
        });
      }
      return next;
    });
  }, []);

  const resetCoachContext = useCallback(() => {
    setContextState(defaultContextState);
    setCoachMessages([createGreetingMessage('general')]);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setCoachMessages([
      createGreetingMessage(
        contextState.mode,
        contextState.situation,
        contextState.shadowingContext,
        contextState.blitzContext
      )
    ]);
    setError(null);
  }, [contextState]);

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
        mode: contextState.mode,
        situation: contextState.situation,
        history: contextState.conversationHistory,
        conversationContext: contextState.conversationContext,
        shadowingContext: contextState.shadowingContext,
        blitzContext: contextState.blitzContext,
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
  }, [questionInput, isLoading, apiKey, model, contextState, coachMessages]);

  const value: CoachContextType = React.useMemo(() => ({
    ...contextState,
    isOpen,
    setIsOpen,
    toggleOpen,
    isLoading,
    error,
    questionInput,
    setQuestionInput,
    coachMessages,
    askQuestion,
    clearHistory,
    updateCoachContext,
    resetCoachContext
  }), [
    contextState,
    isOpen,
    isLoading,
    error,
    questionInput,
    coachMessages,
    toggleOpen,
    askQuestion,
    clearHistory,
    updateCoachContext,
    resetCoachContext
  ]);

  return (
    <CoachContext.Provider value={value}>
      {children}
    </CoachContext.Provider>
  );
}

export { CoachContext };
