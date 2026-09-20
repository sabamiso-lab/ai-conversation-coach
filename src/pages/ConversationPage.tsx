import React, { useEffect } from 'react';
import SituationSelector from '../features/conversation/SituationSelector';
import ChatRoom from '../features/conversation/ChatRoom';
import { useCoach } from '../hooks/useCoach';
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
  const coach = useCoach();

  const selectedSituation = propsSituation !== undefined ? propsSituation : (settings.selectedSituation ?? null);
  const onSelectSituation = propsOnSelect ?? settings.setSelectedSituation;
  const apiKey = propsApiKey ?? settings.apiKey ?? '';
  const model = propsModel ?? settings.model ?? 'gemini-3.5-flash-lite';
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;
  const onResetSession = propsOnReset ?? (() => settings.setSelectedSituation(null));

  const { updateCoachContext } = coach;

  // Sync general conversation coach context when no situation is selected
  useEffect(() => {
    if (!selectedSituation) {
      updateCoachContext({
        mode: 'general',
        situation: null,
        conversationHistory: [],
        conversationContext: null,
        shadowingContext: null,
        blitzContext: null
      });
    }
  }, [selectedSituation, updateCoachContext]);

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
