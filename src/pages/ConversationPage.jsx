import React from 'react';
import SituationSelector from '../features/conversation/SituationSelector';
import ChatRoom from '../features/conversation/ChatRoom';

export default function ConversationPage({ 
  selectedSituation, 
  onSelectSituation, 
  apiKey, 
  model, 
  onOpenApiKeyModal, 
  onResetSession 
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {!selectedSituation ? (
        <SituationSelector
          onSelectSituation={onSelectSituation}
          apiKey={apiKey}
          model={model}
          onOpenApiKeyModal={onOpenApiKeyModal}
        />
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
