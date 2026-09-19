import React from 'react';
import { Mic, Send } from 'lucide-react';
import MicButton from '../../components/common/MicButton';

/**
 * チャットルームの音声認識・テキスト入力・送信コントロールバー
 * @param {Object} props
 * @param {string} props.inputText - 入力テキスト
 * @param {Function} props.onInputChange - テキスト入力ハンドラ
 * @param {Function} props.onSendMessage - メッセージ送信ハンドラ
 * @param {boolean} props.isRecording - 音声認識中フラグ
 * @param {Function} props.onToggleRecording - 音声認識切り替えハンドラ
 * @param {boolean} props.isAiThinking - AI思考中フラグ
 * @param {string} [props.className='chat-controls']
 */
export default function ChatInputBar({
  inputText,
  onInputChange,
  onSendMessage,
  isRecording,
  onToggleRecording,
  isAiThinking,
  className = 'chat-controls'
}) {
  return (
    <div className={className}>
      {/* Status indicator */}
      <div
        style={{
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: isRecording ? '#E11D48' : '#64748B',
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
            <span>🎙️ 音声認識中... 英語で発話してください</span>
          </>
        ) : (
          <>
            <Mic size={14} style={{ flexShrink: 0 }} />
            <span>マイクを押すかテキストを入力してください</span>
          </>
        )}
      </div>

      <div className="input-row">
        <MicButton
          isRecording={isRecording}
          onClick={onToggleRecording}
          iconSize={24}
        />

        <input
          type="text"
          className="input-field"
          placeholder={isRecording ? "音声認識中..." : "英語でメッセージを入力..."}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
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
