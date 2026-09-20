import React, { useState, useEffect } from 'react';
import ShadowingSelector from '../features/shadowing/ShadowingSelector';
import ShadowingPlayer from '../features/shadowing/ShadowingPlayer';
import { useCoach } from '../hooks/useCoach';
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
  const coach = useCoach();

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

  const { updateCoachContext } = coach;

  // Sync state with global CoachContext
  useEffect(() => {
    updateCoachContext({
      mode: selectedScript ? 'shadowing' : 'general',
      situation: null,
      conversationHistory: [],
      conversationContext: null,
      shadowingContext: activeShadowingContext,
      blitzContext: null
    });
  }, [updateCoachContext, selectedScript, activeShadowingContext]);

  const handleBack = () => {
    setSelectedScript(null);
    setShadowingLiveContext(null);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {!selectedScript ? (
        <ShadowingSelector
          onSelectScript={(script: ShadowingScript) => {
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
    </div>
  );
}
