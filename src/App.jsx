import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ApiKeyModal from './components/ApiKeyModal';
import SituationSelector from './components/SituationSelector';
import ChatRoom from './components/ChatRoom';

const STORAGE_KEY = 'gemini_api_key_speakflow';
const STORAGE_MODEL_KEY = 'gemini_model_speakflow';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3.5-flash-lite');
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Load stored API key & model
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    const savedModel = localStorage.getItem(STORAGE_MODEL_KEY);

    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModel(savedModel);
    
    // Open modal on first launch if no API Key
    if (!savedKey) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem(STORAGE_KEY, newKey);
  };

  const handleSaveModel = (newModel) => {
    setModel(newModel);
    localStorage.setItem(STORAGE_MODEL_KEY, newModel);
  };

  return (
    <div className="app-layout">
      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={Boolean(apiKey)}
        selectedSituation={selectedSituation}
        onResetSession={() => setSelectedSituation(null)}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedSituation ? (
          <SituationSelector
            onSelectSituation={(sit) => setSelectedSituation(sit)}
            apiKey={apiKey}
            model={model}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        ) : (
          <ChatRoom
            situation={selectedSituation}
            apiKey={apiKey}
            model={model}
            onBack={() => setSelectedSituation(null)}
          />
        )}
      </main>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
        currentModel={model}
        onSaveModel={handleSaveModel}
      />
    </div>
  );
}
