import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { useSettings } from './hooks/useSettings';
import Header from './components/common/Header';
import ApiKeyModal from './components/common/ApiKeyModal';
import ConversationPage from './pages/ConversationPage';
import ShadowingPage from './pages/ShadowingPage';
import InstantBlitzPage from './pages/InstantBlitzPage';

function AppContent() {
  const {
    apiKey,
    model,
    selectedSituation,
    setSelectedSituation,
    isApiKeyModalOpen,
    saveApiKey,
    saveModel,
    openApiKeyModal,
    closeApiKeyModal
  } = useSettings();

  return (
    <div className="app-layout">
      <Header
        onOpenApiKeyModal={openApiKeyModal}
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
                onOpenApiKeyModal={openApiKeyModal}
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
                onOpenApiKeyModal={openApiKeyModal}
              />
            } 
          />
          <Route 
            path="/blitz" 
            element={
              <InstantBlitzPage
                apiKey={apiKey}
                model={model}
                onOpenApiKeyModal={openApiKeyModal}
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
        onClose={closeApiKeyModal}
        apiKey={apiKey}
        onSaveKey={saveApiKey}
        currentModel={model}
        onSaveModel={saveModel}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </SettingsProvider>
  );
}
