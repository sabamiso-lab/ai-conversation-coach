import React, { useState } from 'react';
import ShadowingSelector from '../features/shadowing/ShadowingSelector';
import ShadowingPlayer from '../features/shadowing/ShadowingPlayer';
import FloatingCoachWidget from '../features/conversation/FloatingCoachWidget';
import { useConversationCoach } from '../hooks/useConversationCoach';
import { useSettings } from '../hooks/useSettings';
import { ShadowingScript, CoachShadowingContext } from '../types';

export interface ShadowingPageProps {
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
}

export default function ShadowingPage({
  apiKey: propsApiKey,
  model: propsModel,
  onOpenApiKeyModal: propsOnOpenApiKeyModal
}: ShadowingPageProps) {
  const settings = useSettings();

  const apiKey = propsApiKey ?? settings.apiKey ?? '';
  const model = propsModel ?? settings.model ?? 'gemini-3.5-flash-lite';
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;

  const [selectedScript, setSelectedScript] = useState<ShadowingScript | null>(null);
  const [shadowingLiveContext, setShadowingLiveContext] = useState<CoachShadowingContext | null>(null);

  const initialShadowingContext: CoachShadowingContext | null = selectedScript ? {
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
          onSelectScript={(script: any) => {
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
