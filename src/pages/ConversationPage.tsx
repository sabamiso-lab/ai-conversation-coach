import React from 'react';
import SituationSelector from '../features/conversation/SituationSelector';
import ChatRoom from '../features/conversation/ChatRoom';
import FloatingCoachWidget from '../features/conversation/FloatingCoachWidget';
import { useConversationCoach } from '../hooks/useConversationCoach';
import { useSettings } from '../hooks/useSettings';
import { Situation } from '../types';

export interface ConversationPageProps {
  selectedSituation?: Situation | null;
  onSelectSituation?: (situation: Situation | null) => void;
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
  onResetSession?: () => void;
}

export default function ConversationPage({ 
  selectedSituation: propsSituation, 
  onSelectSituation: propsOnSelect, 
  apiKey: propsApiKey, 
  model: propsModel, 
  onOpenApiKeyModal: propsOnOpenApiKeyModal, 
  onResetSession: propsOnReset 
}: ConversationPageProps) {
  const settings = useSettings();

  const selectedSituation = propsSituation !== undefined ? propsSituation : (settings.selectedSituation ?? null);
  const onSelectSituation = propsOnSelect ?? settings.setSelectedSituation;
  const apiKey = propsApiKey ?? settings.apiKey ?? '';
  const model = propsModel ?? settings.model ?? 'gemini-3.5-flash-lite';
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;
  const onResetSession = propsOnReset ?? (() => settings.setSelectedSituation(null));

  // Floating Coach for Situation Selection view
  const {
    isOpen: isGeneralCoachOpen,
    toggleOpen: toggleGeneralCoachOpen,
    setIsOpen: setIsGeneralCoachOpen,
    coachMessages: generalCoachMessages,
    isLoading: isGeneralCoachLoading,
    error: generalCoachError,
    questionInput: generalQuestionInput,
    setQuestionInput: setGeneralQuestionInput,
    askQuestion: askGeneralQuestion,
    clearHistory: clearGeneralHistory
  } = useConversationCoach({
    apiKey,
    model,
    situation: null,
    messages: []
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {!selectedSituation ? (
        <>
          <SituationSelector
            onSelectSituation={onSelectSituation}
            apiKey={apiKey}
            model={model}
            onOpenApiKeyModal={onOpenApiKeyModal}
          />
          <FloatingCoachWidget
            isOpen={isGeneralCoachOpen}
            onToggle={toggleGeneralCoachOpen}
            onClose={() => setIsGeneralCoachOpen(false)}
            coachMessages={generalCoachMessages}
            isLoading={isGeneralCoachLoading}
            error={generalCoachError}
            questionInput={generalQuestionInput}
            onQuestionInputChange={setGeneralQuestionInput}
            onAskQuestion={askGeneralQuestion}
            onClearHistory={clearGeneralHistory}
            onApplyPhrase={() => {}}
          />
        </>
      ) : (
        <ChatRoom
          situation={selectedSituation}
          apiKey={apiKey}
          model={model}
          onBack={onResetSession}
        />
      )}
    </div>
  );
}
