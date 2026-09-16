import React, { useState } from 'react';
import ShadowingSelector from '../features/shadowing/ShadowingSelector';
import ShadowingPlayer from '../features/shadowing/ShadowingPlayer';

export default function ShadowingPage({ apiKey, model, onOpenApiKeyModal }) {
  const [selectedScript, setSelectedScript] = useState(null);

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
    </div>
  );
}
