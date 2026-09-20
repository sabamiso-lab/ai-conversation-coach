import React, { useState } from 'react';
import BlitzTopicSelector from '../features/blitz/BlitzTopicSelector';
import BlitzSession from '../features/blitz/BlitzSession';
import BlitzSummary from '../features/blitz/BlitzSummary';
import FloatingCoachWidget from '../features/coach/FloatingCoachWidget';
import { useConversationCoach } from '../hooks/useConversationCoach';
import { useSettings } from '../hooks/useSettings';
import { generateBlitzQuestions } from '../services/gemini';
import { BlitzQuestion, CoachBlitzContext, BlitzSessionSummaryData } from '../types';

export interface InstantBlitzPageProps {
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
}

export default function InstantBlitzPage({
  apiKey: propsApiKey,
  model: propsModel,
  onOpenApiKeyModal: propsOnOpenApiKeyModal
}: InstantBlitzPageProps) {
  const settings = useSettings();

  const apiKey = propsApiKey ?? settings.apiKey ?? '';
  const model = propsModel ?? settings.model ?? 'gemini-3.5-flash-lite';
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;

  // 'selector' | 'session' | 'summary'
  const [viewState, setViewState] = useState<'selector' | 'session' | 'summary'>('selector');

  const [activeTitle, setActiveTitle] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<BlitzQuestion[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState<BlitzSessionSummaryData | null>(null);
  const [blitzLiveContext, setBlitzLiveContext] = useState<CoachBlitzContext | null>(null);

  const isSessionActive = viewState === 'session';

  const activeBlitzContext: CoachBlitzContext | null = isSessionActive ? (blitzLiveContext || {
    topicTitle: activeTitle,
    allQuestions: activeQuestions
  }) : null;

  const {
    isOpen: isCoachOpen,
    toggleOpen: toggleCoachOpen,
    setIsOpen: setIsCoachOpen,
    coachMessages,
    isLoading: isCoachLoading,
    error: coachError,
    questionInput: coachQuestionInput,
    setQuestionInput: setCoachQuestionInput,
    askQuestion: askCoachQuestion,
    clearHistory: clearCoachHistory
  } = useConversationCoach({
    apiKey,
    model,
    mode: isSessionActive ? 'blitz' : 'general',
    blitzContext: activeBlitzContext
  });

  // プリセットトピックでセッション開始
  const handleStartSession = (questions: BlitzQuestion[], title: string, seconds: number) => {
    setActiveTitle(title);
    setActiveQuestions(questions);
    setTimerSeconds(seconds);
    setViewState('session');
  };

  // Gemini AI でお題を生成してセッション開始
  const handleGenerateCustom = async ({ topicPrompt, difficulty, timerSeconds: seconds }: { topicPrompt?: string; difficulty?: string; timerSeconds: number }) => {
    try {
      setIsGenerating(true);
      const generated = await generateBlitzQuestions({
        apiKey,
        model,
        topicPrompt,
        difficulty,
        count: 10
      });

      if (!generated || !Array.isArray(generated.questions) || generated.questions.length === 0) {
        throw new Error('問題データの生成に失敗しました。もう一度お試しください。');
      }

      setActiveTitle(generated.title || 'AIおまかせ英作文セット');
      setActiveQuestions(generated.questions);
      setTimerSeconds(seconds);
      setViewState('session');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`AI生成に失敗しました: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // セッション完了
  const handleCompleteSession = (data: BlitzSessionSummaryData) => {
    setSummaryData(data);
    setViewState('summary');
  };

  // 間違えた問題だけでリトライ
  const handleRetryIncorrect = (incorrectQuestions: BlitzQuestion[]) => {
    setActiveTitle(`${activeTitle} (言えなかった問題リトライ)`);
    setActiveQuestions(incorrectQuestions);
    setViewState('session');
  };

  // 最初からもう一度
  const handleRestartAll = () => {
    setViewState('session');
  };

  // お題一覧へ戻る
  const handleBackToSelector = () => {
    setViewState('selector');
    setSummaryData(null);
    setBlitzLiveContext(null);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {viewState === 'selector' && (
        <BlitzTopicSelector
          onStartSession={handleStartSession}
          onGenerateCustom={handleGenerateCustom}
          isGenerating={isGenerating}
          hasApiKey={Boolean(apiKey)}
          onOpenApiKeyModal={onOpenApiKeyModal}
        />
      )}

      {viewState === 'session' && (
        <BlitzSession
          title={activeTitle}
          questions={activeQuestions}
          timerSeconds={timerSeconds}
          apiKey={apiKey}
          model={model}
          onCompleteSession={handleCompleteSession}
          onExitSession={handleBackToSelector}
          onContextChange={setBlitzLiveContext}
        />
      )}

      {viewState === 'summary' && summaryData && (
        <BlitzSummary
          summaryData={summaryData}
          onRetryIncorrect={handleRetryIncorrect}
          onRestartAll={handleRestartAll}
          onBackToSelector={handleBackToSelector}
        />
      )}

      {/* Floating AI Coach Widget */}
      <FloatingCoachWidget
        mode={isSessionActive ? 'blitz' : 'general'}
        blitzContext={activeBlitzContext}
        isOpen={isCoachOpen}
        onToggle={toggleCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        coachMessages={coachMessages}
        isLoading={isCoachLoading}
        error={coachError}
        questionInput={coachQuestionInput}
        onQuestionInputChange={setCoachQuestionInput}
        onAskQuestion={askCoachQuestion}
        onClearHistory={clearCoachHistory}
      />
    </div>
  );
}
