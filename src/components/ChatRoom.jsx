import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Lightbulb, Flag, Volume2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import MessageItem from './MessageItem';
import HintPanel from './HintPanel';
import ReportModal from './ReportModal';
import { sendChatMessage, getHintSuggestions, generateSessionReport } from '../services/gemini';
import { SpeechRecognizer, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../services/speech';

export default function ChatRoom({ situation, apiKey, model, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hint Modal State
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [hints, setHints] = useState([]);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const recognizerRef = useRef(null);

  // Initialize Speech Recognizer
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      recognizerRef.current = new SpeechRecognizer({
        onResult: ({ final, interim }) => {
          if (final) {
            setInputText(final);
            handleSendMessage(final);
          } else if (interim) {
            setInputText(interim);
          }
        },
        onError: (userFriendlyError) => {
          console.warn("Speech Rec Error:", userFriendlyError);
          setErrorMsg(userFriendlyError);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    }

    // Load initial AI greeting
    if (situation.initialMessage) {
      const initialAiMsg = {
        id: 'msg-0',
        role: 'ai',
        text: situation.initialMessage,
        translation: 'こんにちは！お話しできて嬉しいです。本日はいかがなさいますか？'
      };
      setMessages([initialAiMsg]);
      speakText(situation.initialMessage);
    }

    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, [situation]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Handle Mic Toggle
  const toggleRecording = () => {
    if (!recognizerRef.current) {
      setErrorMsg("お使いのブラウザは音声認識(Web Speech API)に対応していません。テキスト入力をご利用ください。");
      return;
    }

    if (isRecording) {
      recognizerRef.current.stop();
      setIsRecording(false);
    } else {
      setErrorMsg('');
      setIsRecording(true);
      recognizerRef.current.start();
    }
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend) => {
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

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiThinking(true);
    setErrorMsg('');

    try {
      const aiResponse = await sendChatMessage({
        apiKey,
        model,
        situation,
        history: messages,
        userText: text.trim()
      });

      // Update user message with translation and phrasing suggestions
      setMessages(prev => prev.map(m => m.id === userMessage.id ? {
        ...m,
        userTextTranslation: aiResponse.userTextTranslation,
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
  };

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
      setErrorMsg("評価レポートの作成に失敗しました。");
    } finally {
      setIsReportLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Top Bar inside Chat */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={18} /> シチュエーション変更
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-purple">{situation.titleJa}</span>
          <button className="btn btn-accent" onClick={handleFinishSession}>
            <Flag size={16} /> セッションを終了して診断
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

            <button 
              className="btn btn-secondary" 
              onClick={handleFetchHints}
              title="ヒントを見る"
              style={{ fontSize: '0.85rem' }}
            >
              <Lightbulb size={16} color="#F59E0B" /> ヒント
            </button>
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

      {/* Score & Evaluation Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={reportData}
        loading={isReportLoading}
        onRestart={onBack}
      />
    </div>
  );
}
