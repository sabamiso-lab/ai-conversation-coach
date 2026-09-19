import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/common/Header';
import ApiKeyModal from './components/common/ApiKeyModal';
import ConversationPage from './pages/ConversationPage';
import ShadowingPage from './pages/ShadowingPage';
import InstantBlitzPage from './pages/InstantBlitzPage';

function AppContent() {
  return (
    <div className="app-layout">
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<ConversationPage />} />
          <Route path="/conversation" element={<Navigate to="/" replace />} />
          <Route path="/shadowing" element={<ShadowingPage />} />
          <Route path="/blitz" element={<InstantBlitzPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ApiKeyModal />
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
