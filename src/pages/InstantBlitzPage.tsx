import React, { useState, useEffect } from 'react';
import BlitzTopicSelector from '../features/blitz/BlitzTopicSelector';
import BlitzSession from '../features/blitz/BlitzSession';
import BlitzSummary from '../features/blitz/BlitzSummary';
import { useCoach } from '../hooks/useCoach';
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
  const coach = useCoach();

  const apiKey = propsApiKey ?? settings.apiKey ?? '';
  const model = propsModel ?? settings.model ?? 'gemini-3.5-flash-lite';
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;

  // 'selector' | 'session' | 'summary'
  const [viewState, setViewState] = useState<'selector' | 'session' | 'summary'>('selector');

  const [activeTitle, setActiveTitle] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<BlitzQuestion[]>([]);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalQuestions, setOriginalQuestions] = useState<BlitzQuestion[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState<BlitzSessionSummaryData | null>(null);
  const [blitzLiveContext, setBlitzLiveContext] = useState<CoachBlitzContext | null>(null);

  const isSessionActive = viewState === 'session';

  const activeBlitzContext = React.useMemo<CoachBlitzContext | null>(() => {
    if (!isSessionActive) return null;
    return blitzLiveContext || {
      topicTitle: activeTitle,
      allQuestions: activeQuestions
    };
  }, [isSessionActive, blitzLiveContext, activeTitle, activeQuestions]);

  const { updateCoachContext } = coach;

  // Sync state with global CoachContext
  useEffect(() => {
    updateCoachContext({
      mode: isSessionActive ? 'blitz' : 'general',
      situation: null,
      conversationHistory: [],
      conversationContext: null,
      shadowingContext: null,
      blitzContext: activeBlitzContext
    });
  }, [updateCoachContext, isSessionActive, activeBlitzContext]);

  // プリセットトピックでセッション開始
  const handleStartSession = (questions: BlitzQuestion[], title: string, seconds: number) => {
    setOriginalTitle(title);
    setOriginalQuestions(questions);
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

      const generatedTitle = generated.title || 'AIおまかせ英作文セット';
      setOriginalTitle(generatedTitle);
      setOriginalQuestions(generated.questions);
      setActiveTitle(generatedTitle);
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
    const baseTitle = originalTitle || activeTitle;
    setActiveTitle(`${baseTitle} (言えなかった問題リトライ)`);
    setActiveQuestions(incorrectQuestions);
    setViewState('session');
  };

  // 最初からもう一度（元のお題・全問題でやり直す）
  const handleRestartAll = () => {
    if (originalTitle) setActiveTitle(originalTitle);
    if (originalQuestions.length > 0) setActiveQuestions(originalQuestions);
    setViewState('session');
  };

  // お題一覧へ戻る
  const handleBackToSelector = () => {
    setViewState('selector');
    setSummaryData(null);
    setBlitzLiveContext(null);
    setOriginalTitle('');
    setOriginalQuestions([]);
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
    </div>
  );
}
