import React from 'react';
import SituationSelector from '../features/conversation/SituationSelector';
import ChatRoom from '../features/conversation/ChatRoom';
import FloatingCoachWidget from '../features/conversation/FloatingCoachWidget';
import { useConversationCoach } from '../hooks/useConversationCoach';

export default function ConversationPage({ 
  selectedSituation, 
  onSelectSituation, 
  apiKey, 
  model, 
  onOpenApiKeyModal, 
  onResetSession 
}) {
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
