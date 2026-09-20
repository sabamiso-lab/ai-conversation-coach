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

function isContextEqual(prev: CoachContextState, updates: Partial<CoachContextState>): boolean {
  if (updates.mode !== undefined && updates.mode !== prev.mode) return false;
  if (updates.situation !== undefined && updates.situation?.id !== prev.situation?.id) return false;
  if (updates.conversationHistory !== undefined && updates.conversationHistory !== prev.conversationHistory) {
    if (updates.conversationHistory.length !== prev.conversationHistory.length) return false;
    for (let i = 0; i < updates.conversationHistory.length; i++) {
      const u = updates.conversationHistory[i];
      const p = prev.conversationHistory[i];
      if (u.id !== p.id || u.text !== p.text || u.translation !== p.translation || u.clarityStatus !== p.clarityStatus) {
        return false;
      }
    }
  }
  if (updates.conversationContext !== undefined) {
    if (updates.conversationContext?.currentUserInput !== prev.conversationContext?.currentUserInput) return false;
  }
  if (updates.shadowingContext !== undefined) {
    const p = prev.shadowingContext;
    const u = updates.shadowingContext;
    if (p !== u) {
      if (!p || !u) return false;
      if (p.title !== u.title) return false;
      if (p.targetText !== u.targetText) return false;
      if (p.fullText !== u.fullText) return false;
      if (p.userSpeech !== u.userSpeech) return false;
      if (p.isRecording !== u.isRecording) return false;
      if (p.evalResult?.overallScore !== u.evalResult?.overallScore) return false;
      if (p.evalResult?.feedbackJa !== u.evalResult?.feedbackJa) return false;
    }
  }
  if (updates.blitzContext !== undefined) {
    const p = prev.blitzContext;
    const u = updates.blitzContext;
    if (p !== u) {
      if (!p || !u) return false;
      if (p.topicTitle !== u.topicTitle) return false;
      if (p.currentIndex !== u.currentIndex) return false;
      if (p.totalQuestions !== u.totalQuestions) return false;
      if (p.currentQuestion?.japanese !== u.currentQuestion?.japanese) return false;
      if (p.currentQuestion?.sampleAnswer !== u.currentQuestion?.sampleAnswer) return false;
      if (p.userSpeech !== u.userSpeech) return false;
      if (p.isCorrect !== u.isCorrect) return false;
      if (p.isRevealed !== u.isRevealed) return false;
      if (p.aiEvaluation?.feedbackJa !== u.aiEvaluation?.feedbackJa) return false;
    }
  }
  return true;
}

function createGreetingMessage(
  mode: CoachMode,
  situation?: Situation | null,
  shadowingContext?: CoachShadowingContext | null,
  blitzContext?: CoachBlitzContext | null
): CoachMessage {
  if (mode === 'shadowing' || (mode === 'general' && shadowingContext)) {
    const title = shadowingContext?.title || 'シャドーイング特訓';
    return {
      id: 'coach-init',
      role: 'assistant',
      text: `こんにちは！シャドーイング専属AIコーチです🎧\n現在「${title}」の英文スクリプトを把握しています。\n\n「リエゾン・脱落など発音のコツは？」「この文の構文・意味は？」「リズムよく発話するには？」など、何でも日本語で気軽に相談してください！`,
      timestamp: 0
    };
  }
  if (mode === 'blitz' || (mode === 'general' && blitzContext)) {
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
      const modeChanged = updates.mode !== undefined && updates.mode !== prev.mode;
      const situationChanged = updates.situation !== undefined && updates.situation?.id !== prev.situation?.id;
      const scriptChanged = updates.shadowingContext !== undefined && updates.shadowingContext?.title !== prev.shadowingContext?.title;
      const blitzTopicChanged = updates.blitzContext !== undefined && updates.blitzContext?.topicTitle !== prev.blitzContext?.topicTitle;

      const sessionChanged = modeChanged || situationChanged || scriptChanged || blitzTopicChanged;

      if (!sessionChanged && isContextEqual(prev, updates)) {
        return prev;
      }

      const next = { ...prev, ...updates };

      if (sessionChanged) {
        setCoachMessages([
          createGreetingMessage(next.mode, next.situation, next.shadowingContext, next.blitzContext)
        ]);
        setError(null);
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
        coachHistory: coachMessages.filter(ch => ch.id !== 'coach-init')
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
