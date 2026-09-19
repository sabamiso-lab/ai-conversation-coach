import React, { useState } from 'react';
import ShadowingSelector from '../features/shadowing/ShadowingSelector';
import ShadowingPlayer from '../features/shadowing/ShadowingPlayer';
import FloatingCoachWidget from '../features/conversation/FloatingCoachWidget';
import { useConversationCoach } from '../hooks/useConversationCoach';

export default function ShadowingPage({ apiKey, model, onOpenApiKeyModal }) {
  const [selectedScript, setSelectedScript] = useState(null);
  const [shadowingLiveContext, setShadowingLiveContext] = useState(null);

  const initialShadowingContext = selectedScript ? {
    title: selectedScript.title,
    category: selectedScript.category,
    fullText: selectedScript.fullText,
    sentences: selectedScript.sentences
  } : null;

  const activeShadowingContext = selectedScript 
    ? (shadowingLiveContext || initialShadowingContext) 
    : null;

  // Floating AI Shadowing Coach State
  const {
    isOpen: isCoachOpen,
    setIsOpen: setIsCoachOpen,
    toggleOpen: toggleCoachOpen,
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
    mode: selectedScript ? 'shadowing' : 'general',
    shadowingContext: activeShadowingContext
  });

  const handleBack = () => {
    setSelectedScript(null);
    setShadowingLiveContext(null);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {!selectedScript ? (
        <ShadowingSelector
          onSelectScript={(script) => {
            setSelectedScript(script);
            setShadowingLiveContext(null);
          }}
          apiKey={apiKey}
          model={model}
          onOpenApiKeyModal={onOpenApiKeyModal}
        />
      ) : (
        <ShadowingPlayer
          script={selectedScript}
          onBack={handleBack}
          apiKey={apiKey}
          model={model}
          onOpenApiKeyModal={onOpenApiKeyModal}
          onContextChange={setShadowingLiveContext}
        />
      )}

      {/* Floating AI Coach Widget */}
      <FloatingCoachWidget
        mode={selectedScript ? 'shadowing' : 'general'}
        shadowingContext={activeShadowingContext}
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
