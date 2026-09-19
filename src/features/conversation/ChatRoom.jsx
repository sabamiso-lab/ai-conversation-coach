import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Lightbulb, Flag, Sparkles, AlertCircle, ArrowLeft, ExternalLink, Globe, Target, X } from 'lucide-react';
import MessageItem from './MessageItem';
import HintPanel from './HintPanel';
import ReportModal from './ReportModal';
import { sendChatMessage, getHintSuggestions, generateSessionReport } from '../../services/gemini';
import { speakText, stopSpeaking } from '../../services/speech';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ChatRoom({ situation, apiKey, model, onBack }) {
  const [messages, setMessages] = useState(() => {
    if (situation?.initialMessage) {
      return [{
        id: 'msg-0',
        role: 'ai',
        text: situation.initialMessage,
        translation: situation.initialMessageJa || situation.initialMessageTranslation || ''
      }];
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Goals Modal State for Mobile
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  // Hint Modal State
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [hints, setHints] = useState([]);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const messagesEndRef = useRef(null);

  // Handle Send Message
  const handleSendMessage = useCallback(async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isAiThinking) return;

    if (!apiKey) {
      setErrorMsg("Gemini API Key が設定されていません。画面右上の [API Key 設定] から登録してください。");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim()
    };

    let updatedMessages = [];
    setMessages(prev => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });

    setInputText('');
    setIsAiThinking(true);
    setErrorMsg('');

    try {
      const aiResponse = await sendChatMessage({
        apiKey,
        model,
        situation,
        history: updatedMessages.slice(0, -1),
        userText: text.trim()
      });

      // Update user message with translation, clarity feedback, and phrasing suggestions
      setMessages(prev => prev.map(m => m.id === userMessage.id ? {
        ...m,
        userTextTranslation: aiResponse.userTextTranslation,
        clarityStatus: aiResponse.clarityStatus,
        clarityBadgeJa: aiResponse.clarityBadgeJa,
        clarityFeedbackJa: aiResponse.clarityFeedbackJa,
        simpleAlternative: aiResponse.simpleAlternative,
        betterPhrasing: aiResponse.betterPhrasing,
        phrasingTip: aiResponse.phrasingTip
      } : m));

      // Append AI response
      const newAiMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: aiResponse.aiResponseText,
        translation: aiResponse.aiResponseTranslation
      };

      setMessages(prev => [...prev, newAiMessage]);

      // Speak AI response automatically
      speakText(aiResponse.aiResponseText);

    } catch (err) {
      console.error("API error:", err);
      setErrorMsg(err.message || "Gemini API の呼び出し中にエラーが発生しました。");
    } finally {
      setIsAiThinking(false);
    }
  }, [inputText, isAiThinking, apiKey, model, situation]);

  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleFinalResult = useCallback((finalText) => {
    setInputText(finalText);
    if (handleSendMessageRef.current) {
      handleSendMessageRef.current(finalText);
    }
  }, []);

  const handleInterimResult = useCallback((interimText) => {
    setInputText(interimText);
  }, []);

  const handleSpeechError = useCallback((speechErr) => {
    setErrorMsg(speechErr);
  }, []);

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

  // Get Hint Suggestions
  const handleFetchHints = async () => {
    setIsHintOpen(true);
    setIsHintLoading(true);
    try {
      const hintList = await getHintSuggestions({
        apiKey,
        model,
        situation,
        history: messages
      });
      setHints(hintList);
    } catch (err) {
      console.error("Hint error:", err);
      setErrorMsg("ヒントの生成に失敗しました。APIキーを確認してください。");
    } finally {
      setIsHintLoading(false);
    }
  };

  // Finish Session & Generate Report
  const handleFinishSession = async () => {
    setIsReportOpen(true);
    setIsReportLoading(true);
    setReportError('');
    try {
      const report = await generateSessionReport({
        apiKey,
        model,
        situation,
        history: messages
      });
      setReportData(report);
    } catch (err) {
      console.error("Report error:", err);
      const msg = err.message || "評価レポートの作成に失敗しました。";
      setReportError(msg);
      setErrorMsg(msg);
    } finally {
      setIsReportLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, animation: 'fadeIn 0.3s ease-out' }}>
      {/* Top Bar inside Chat */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={18} /> <span className="btn-text-desktop">シチュエーション</span>変更
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-indigo" style={{ fontSize: '0.85rem' }}>{situation.titleJa}</span>
          <button className="btn btn-accent" onClick={handleFinishSession} style={{ borderRadius: '10px' }}>
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
                onClick={handleFetchHints}
                title="ヒントを見る"
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <Lightbulb size={16} color="#F59E0B" /> <span className="btn-text-desktop">ヒント</span>
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
          <div className="chat-controls">
            {/* Status indicator */}
            <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: isRecording ? '#E11D48' : '#64748B', fontWeight: 600 }}>
              {isRecording ? (
                <>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F43F5E', display: 'inline-block', animation: 'pulseMic 1s infinite' }} />
                  🎙️ 音声認識中... マイクに向かって英語で話してください
                </>
              ) : (
                <>
                  <Mic size={14} /> マイクボタンを押すか、直接テキストを入力してください
                </>
              )}
            </div>

            <div className="input-row">
              <button 
                className={`mic-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                title={isRecording ? "マイク停止" : "マイクで英語を話す"}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <input
                type="text"
                className="input-field"
                placeholder={isRecording ? "話している内容を音声認識中..." : "英語でメッセージを入力するか、マイクボタンを押してください..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isAiThinking}
              />

              <button 
                className="btn btn-primary"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isAiThinking}
                style={{ padding: '12px 20px', borderRadius: '9999px' }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Info Panel */}
        <div className="sidebar-panel">
          {situation.newsSource && (
            <div className="info-card" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
              <div className="info-title" style={{ color: '#5B21B6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} /> 関連ニュース記事 (Grounding)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4C1D95', marginBottom: '8px', fontWeight: 600 }}>
                {situation.newsSource.title}
              </div>
              <a
                href={situation.newsSource.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  color: '#4F46E5',
                  fontWeight: 700,
                  textDecoration: 'underline'
                }}
              >
                <ExternalLink size={12} /> 元ニュース記事を開く
              </a>
            </div>
          )}

          <div className="info-card">
            <div className="info-title">
              会話シナリオ目標
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
              {situation.descriptionJa}
            </div>

            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748B', uppercase: 'true', marginBottom: '8px' }}>
              MISSION GOALS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {situation.goals.map((g, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: '#1E293B', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#4F46E5', fontWeight: 800 }}>✓</span> {g}
                </div>
              ))}
            </div>
          </div>

          <div className="info-card" style={{ background: '#EEF2FF', borderColor: '#C7D2FE' }}>
            <div className="info-title" style={{ color: '#3730A3' }}>
              💡 学習アドバイス
            </div>
            <p style={{ fontSize: '0.82rem', color: '#4338CA', lineHeight: 1.5 }}>
              完璧な英文を話そうと焦る必要はありません！間違えてもAIがネイティブらしい自然な言い回しをその場でアドバイスしてくれます。
            </p>
          </div>
        </div>
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
      {isGoalsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={22} color="#4F46E5" />
                <h2 className="modal-title">会話シナリオ目標 & ニュース情報</h2>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsGoalsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {situation.newsSource && (
                <div className="info-card" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
                  <div className="info-title" style={{ color: '#5B21B6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={16} /> 関連ニュース記事 (Grounding)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4C1D95', marginBottom: '8px', fontWeight: 600 }}>
                    {situation.newsSource.title}
                  </div>
                  <a
                    href={situation.newsSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      color: '#4F46E5',
                      fontWeight: 700,
                      textDecoration: 'underline'
                    }}
                  >
                    <ExternalLink size={12} /> 元ニュース記事を開く
                  </a>
                </div>
              )}

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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => setIsGoalsModalOpen(false)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score & Evaluation Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={reportData}
        loading={isReportLoading}
        error={reportError}
        onRestart={onBack}
        onRetry={handleFinishSession}
      />
    </div>
  );
}
