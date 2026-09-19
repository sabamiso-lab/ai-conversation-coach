import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, Flag, Sparkles, AlertCircle, ArrowLeft, Target } from 'lucide-react';
import Modal from '../../components/common/Modal';
import NewsCitation from '../../components/common/NewsCitation';
import MessageItem from './MessageItem';
import HintPanel from './HintPanel';
import ReportModal from './ReportModal';
import ChatSidebar from './ChatSidebar';
import ChatInputBar from './ChatInputBar';
import { speakText, stopSpeaking } from '../../services/speech';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useChatSession } from '../../hooks/useChatSession';
import { useConversationCoach } from '../../hooks/useConversationCoach';
import FloatingCoachWidget from './FloatingCoachWidget';

export default function ChatRoom({ situation, apiKey, model, onBack }) {
  const {
    messages,
    inputText,
    setInputText,
    isAiThinking,
    errorMsg,
    setErrorMsg,
    sendMessage,
    isHintOpen,
    setIsHintOpen,
    hints,
    isHintLoading,
    fetchHints,
    isReportOpen,
    setIsReportOpen,
    reportData,
    isReportLoading,
    reportError,
    finishSession
  } = useChatSession({ situation, apiKey, model });

  // Floating AI Conversation Coach State
  const {
    isOpen: isCoachOpen,
    setIsOpen: setIsCoachOpen,
    toggleOpen: toggleCoachOpen,
    coachMessages,
    isLoading: isCoachLoading,
    error: coachError,
    questionInput: coachQuestionInput,
    setQuestionInput: setCoachQuestionInput,
    askQuestion: askCoachQuestion,
    clearHistory: clearCoachHistory
  } = useConversationCoach({
    apiKey,
    model,
    situation,
    messages,
    conversationContext: { currentUserInput: inputText }
  });

  // Goals Modal State for Mobile
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Wrap sendMessage with TTS callback for AI response
  const handleSendMessage = useCallback((textToSend) => {
    sendMessage(textToSend, (aiText) => {
      speakText(aiText);
    });
  }, [sendMessage]);

  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleFinalResult = useCallback((finalText) => {
    setInputText(finalText);
    if (handleSendMessageRef.current) {
      handleSendMessageRef.current(finalText);
    }
  }, [setInputText]);

  const handleInterimResult = useCallback((interimText) => {
    setInputText(interimText);
  }, [setInputText]);

  const handleSpeechError = useCallback((speechErr) => {
    setErrorMsg(speechErr);
  }, [setErrorMsg]);

  const { isRecording, toggleRecording } = useSpeechRecognition({
    onFinalResult: handleFinalResult,
    onInterimResult: handleInterimResult,
    onError: handleSpeechError
  });

  // Initial Speech & Cleanup
  useEffect(() => {
    if (situation.initialMessage) {
      speakText(situation.initialMessage);
    }

    return () => {
      stopSpeaking();
    };
  }, [situation]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, animation: 'fadeIn 0.3s ease-out' }}>
      {/* Top Bar inside Chat */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={18} /> <span className="btn-text-desktop">シチュエーション</span>変更
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-indigo" style={{ fontSize: '0.85rem' }}>{situation.titleJa}</span>
          <button className="btn btn-accent" onClick={finishSession} style={{ borderRadius: '10px' }}>
            <Flag size={16} /> <span>終了診断</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#FFE4E6', border: '1px solid #FECDD3', color: '#E11D48', padding: '12px 16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      <div className="chat-container">
        {/* Main Messages Column */}
        <div className="chat-main">
          {/* Header info inside Chat card */}
          <div className="chat-header">
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{situation.title}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                AI Role: <strong>{situation.systemRole}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsGoalsModalOpen(true)}
                title="シナリオ目標を見る"
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <Target size={16} color="#4F46E5" /> <span className="btn-text-desktop">目標</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={fetchHints}
                title="ヒントを見る"
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <Lightbulb size={16} color="#F59E0B" /> <span className="btn-text-desktop">ヒント</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={toggleCoachOpen}
                title="AIコーチに現在の会話について相談する"
                style={{ fontSize: '0.85rem', padding: '6px 12px', background: isCoachOpen ? '#EEF2FF' : undefined, borderColor: isCoachOpen ? '#818CF8' : undefined }}
              >
                <Sparkles size={16} color="#6366F1" /> <span className="btn-text-desktop">AI相談</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.map(msg => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {isAiThinking && (
              <div className="message-row ai">
                <div className="message-sender">AI Coach</div>
                <div className="message-bubble" style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles className="animate-spin" size={16} color="#4F46E5" />
                  AIが返答を考えています...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Controls Bar */}
          <ChatInputBar
            inputText={inputText}
            onInputChange={setInputText}
            onSendMessage={handleSendMessage}
            isRecording={isRecording}
            onToggleRecording={toggleRecording}
            isAiThinking={isAiThinking}
          />
        </div>

        {/* Right Sidebar Info Panel */}
        <ChatSidebar situation={situation} />
      </div>

      {/* Hint Modal */}
      <HintPanel
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        hints={hints}
        loading={isHintLoading}
        onSelectHint={(hintText) => {
          setInputText(hintText);
          handleSendMessage(hintText);
        }}
      />

      {/* Goals & News Info Modal for Mobile & Quick Access */}
      <Modal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        title="会話シナリオ目標 & ニュース情報"
        icon={<Target size={22} color="#4F46E5" />}
        maxWidth="520px"
        footer={
          <button className="btn btn-primary" onClick={() => setIsGoalsModalOpen(false)}>
            閉じる
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <NewsCitation newsSource={situation.newsSource} variant="card" />

          <div className="info-card">
            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '12px', fontWeight: 600 }}>
              {situation.descriptionJa}
            </div>

            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748B', uppercase: 'true', marginBottom: '8px' }}>
              MISSION GOALS (達成目標)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {situation.goals.map((g, i) => (
                <div key={i} style={{ fontSize: '0.88rem', color: '#1E293B', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#4F46E5', fontWeight: 800 }}>✓</span> {g}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Score & Evaluation Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={reportData}
        loading={isReportLoading}
        error={reportError}
        onRestart={onBack}
        onRetry={finishSession}
      />

      {/* Floating AI Coach Assistant Widget */}
      <FloatingCoachWidget
        mode="conversation"
        situation={situation}
        conversationHistory={messages}
        conversationContext={{ currentUserInput: inputText }}
        isOpen={isCoachOpen}
        onToggle={toggleCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        coachMessages={coachMessages}
        isLoading={isCoachLoading}
        error={coachError}
        questionInput={coachQuestionInput}
        onQuestionInputChange={setCoachQuestionInput}
        onAskQuestion={askCoachQuestion}
        onClearHistory={clearCoachHistory}
        onApplyPhrase={(phrase) => {
          setInputText(phrase);
        }}
      />
    </div>
  );
}
