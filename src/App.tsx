import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { CoachProvider } from './contexts/CoachContext';
import { useCoach } from './hooks/useCoach';
import Header from './components/common/Header';
import ApiKeyModal from './components/common/ApiKeyModal';
import ConversationPage from './pages/ConversationPage';
import ShadowingPage from './pages/ShadowingPage';
import InstantBlitzPage from './pages/InstantBlitzPage';
import FloatingCoachWidget from './features/coach/FloatingCoachWidget';

function GlobalCoachWidget() {
  const coach = useCoach();

  return (
    <FloatingCoachWidget
      mode={coach.mode}
      situation={coach.situation}
      conversationHistory={coach.conversationHistory}
      conversationContext={coach.conversationContext}
      shadowingContext={coach.shadowingContext}
      blitzContext={coach.blitzContext}
      isOpen={coach.isOpen}
      onToggle={coach.toggleOpen}
      onClose={() => coach.setIsOpen(false)}
      coachMessages={coach.coachMessages}
      isLoading={coach.isLoading}
      error={coach.error}
      questionInput={coach.questionInput}
      onQuestionInputChange={coach.setQuestionInput}
      onAskQuestion={coach.askQuestion}
      onClearHistory={coach.clearHistory}
    />
  );
}

function AppContent() {
  return (
    <div className="app-layout">
      <Header />

      <main className="flex-1 flex-col">
        <Routes>
          <Route path="/" element={<ConversationPage />} />
          <Route path="/conversation" element={<Navigate to="/" replace />} />
          <Route path="/shadowing" element={<ShadowingPage />} />
          <Route path="/blitz" element={<InstantBlitzPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ApiKeyModal />
      <GlobalCoachWidget />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <CoachProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </CoachProvider>
    </SettingsProvider>
  );
}
