import React, { useState } from 'react';
import ShadowingSelector from '../features/shadowing/ShadowingSelector';
import ShadowingPlayer from '../features/shadowing/ShadowingPlayer';
import FloatingCoachWidget from '../features/conversation/FloatingCoachWidget';
import { useConversationCoach } from '../hooks/useConversationCoach';

export default function ShadowingPage({ apiKey, model, onOpenApiKeyModal }) {
  const [selectedScript, setSelectedScript] = useState(null);

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
    mode: selectedScript ? 'shadowing' : 'general',
    shadowingContext: selectedScript ? {
      title: selectedScript.title,
      category: selectedScript.category,
      fullText: selectedScript.fullText,
      sentences: selectedScript.sentences
    } : null
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {!selectedScript ? (
        <ShadowingSelector
          onSelectScript={(script) => setSelectedScript(script)}
          apiKey={apiKey}
          model={model}
          onOpenApiKeyModal={onOpenApiKeyModal}
        />
      ) : (
        <ShadowingPlayer
          script={selectedScript}
          onBack={() => setSelectedScript(null)}
          apiKey={apiKey}
          model={model}
          onOpenApiKeyModal={onOpenApiKeyModal}
        />
      )}

      {/* Floating AI Coach Widget */}
      <FloatingCoachWidget
        mode={selectedScript ? 'shadowing' : 'general'}
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
