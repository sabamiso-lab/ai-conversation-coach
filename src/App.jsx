import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import ApiKeyModal from './components/common/ApiKeyModal';
import ConversationPage from './pages/ConversationPage';
import ShadowingPage from './pages/ShadowingPage';

const STORAGE_KEY = 'gemini_api_key_speakflow';
const STORAGE_MODEL_KEY = 'gemini_model_speakflow';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [model, setModel] = useState(() => localStorage.getItem(STORAGE_MODEL_KEY) || 'gemini-3.5-flash-lite');
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem(STORAGE_KEY, newKey);
  };

  const handleSaveModel = (newModel) => {
    setModel(newModel);
    localStorage.setItem(STORAGE_MODEL_KEY, newModel);
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          hasApiKey={Boolean(apiKey)}
          selectedSituation={selectedSituation}
          onResetSession={() => setSelectedSituation(null)}
        />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route 
              path="/" 
              element={
                <ConversationPage
                  selectedSituation={selectedSituation}
                  onSelectSituation={(sit) => setSelectedSituation(sit)}
                  apiKey={apiKey}
                  model={model}
                  onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                  onResetSession={() => setSelectedSituation(null)}
                />
              } 
            />
            <Route 
              path="/conversation" 
              element={<Navigate to="/" replace />} 
            />
            <Route 
              path="/shadowing" 
              element={
                <ShadowingPage
                  apiKey={apiKey}
                  model={model}
                  onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                />
              } 
            />
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
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
    </BrowserRouter>
  );
}
