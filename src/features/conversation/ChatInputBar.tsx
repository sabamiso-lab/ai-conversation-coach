import React from 'react';
import { Mic, Send } from 'lucide-react';
import MicButton from '../../components/common/MicButton';

export interface ChatInputBarProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isAiThinking: boolean;
  isSupported?: boolean;
  className?: string;
}

/**
 * チャットルームの音声認識・テキスト入力・送信コントロールバー
 */
export default function ChatInputBar({
  inputText,
  onInputChange,
  onSendMessage,
  isRecording,
  onToggleRecording,
  isAiThinking,
  isSupported = true,
  className = 'chat-controls'
}: ChatInputBarProps) {
  return (
    <div className={className}>
      {/* Status indicator */}
      <div
        style={{
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: isRecording ? '#E11D48' : !isSupported ? '#94A3B8' : '#64748B',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {isRecording ? (
          <>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F43F5E',
                display: 'inline-block',
                flexShrink: 0,
                animation: 'pulseMic 1s infinite'
              }}
            />
            <span>🎙️ 音声認識中... 英語で発話してください（マイク再押下で完了）</span>
          </>
        ) : !isSupported ? (
          <>
            <Mic size={14} style={{ flexShrink: 0 }} />
            <span>音声認識非対応のブラウザです（テキストで入力してください）</span>
          </>
        ) : (
          <>
            <Mic size={14} style={{ flexShrink: 0 }} />
            <span>マイクで発話するか、テキストを入力して送信してください</span>
          </>
        )}
      </div>

      <div className="input-row">
        <MicButton
          isRecording={isRecording}
          onClick={onToggleRecording}
          iconSize={24}
          disabled={isAiThinking || !isSupported}
          title={!isSupported ? 'お使いのブラウザは音声認識に対応していません' : isAiThinking ? 'AIが返答中はマイクを使用できません' : undefined}
        />

        <input
          type="text"
          className="input-field"
          placeholder={isRecording ? "音声認識中... 話し終わったら送信できます" : "英語でメッセージを入力..."}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            const isComposing =
              Boolean(e.nativeEvent && 'isComposing' in e.nativeEvent && (e.nativeEvent as unknown as { isComposing: boolean }).isComposing) ||
              Boolean('isComposing' in e && (e as unknown as { isComposing: boolean }).isComposing) ||
              (e as unknown as { keyCode?: number }).keyCode === 229;

            if (e.key === 'Enter' && !isComposing && !isAiThinking && inputText.trim()) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          disabled={isAiThinking}
        />

        <button 
          className="btn btn-primary btn-send-chat"
          onClick={() => onSendMessage()}
          disabled={!inputText.trim() || isAiThinking}
          style={{ borderRadius: '9999px' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
