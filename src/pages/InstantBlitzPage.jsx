import React, { useState } from 'react';
import BlitzTopicSelector from '../features/blitz/BlitzTopicSelector';
import BlitzSession from '../features/blitz/BlitzSession';
import BlitzSummary from '../features/blitz/BlitzSummary';
import FloatingCoachWidget from '../features/conversation/FloatingCoachWidget';
import { useConversationCoach } from '../hooks/useConversationCoach';
import { generateBlitzQuestions } from '../services/gemini';

export default function InstantBlitzPage({ apiKey, model, onOpenApiKeyModal }) {
  // 'selector' | 'session' | 'summary'
  const [viewState, setViewState] = useState('selector');

  const [activeTitle, setActiveTitle] = useState('');
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const isSessionActive = viewState === 'session';

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
    blitzContext: isSessionActive ? {
      topicTitle: activeTitle,
      allQuestions: activeQuestions
    } : null
  });

  // プリセットトピックでセッション開始
  const handleStartSession = (questions, title, seconds) => {
    setActiveTitle(title);
    setActiveQuestions(questions);
    setTimerSeconds(seconds);
    setViewState('session');
  };

  // Gemini AI でお題を生成してセッション開始
  const handleGenerateCustom = async ({ topicPrompt, difficulty, timerSeconds: seconds }) => {
    try {
      setIsGenerating(true);
      const generated = await generateBlitzQuestions({
        apiKey,
        model,
        topicPrompt,
        difficulty,
        count: 10
      });

      setActiveTitle(generated.title);
      setActiveQuestions(generated.questions);
      setTimerSeconds(seconds);
      setViewState('session');
    } catch (err) {
      alert(`AI生成に失敗しました: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // セッション完了
  const handleCompleteSession = (data) => {
    setSummaryData(data);
    setViewState('summary');
  };

  // 間違えた問題だけでリトライ
  const handleRetryIncorrect = (incorrectQuestions) => {
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
