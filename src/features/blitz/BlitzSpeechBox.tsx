import React, { useState } from 'react';
import { Mic, MicOff, Edit2, Check } from 'lucide-react';

export interface BlitzSpeechBoxProps {
  isListening: boolean;
  isRevealed: boolean;
  userTranscript: string;
  interimTranscript: string;
  speechError: string;
  onToggleMic: () => void;
  onSaveEditedSpeech: (text: string) => void;
}

export default function BlitzSpeechBox({
  isListening,
  isRevealed,
  userTranscript,
  interimTranscript,
  speechError,
  onToggleMic,
  onSaveEditedSpeech
}: BlitzSpeechBoxProps) {
  const [isEditingSpeech, setIsEditingSpeech] = useState(false);
  const [editedSpeechText, setEditedSpeechText] = useState('');

  const fullUserText = `${userTranscript} ${interimTranscript}`.trim();

  const handleStartEditSpeech = () => {
    setEditedSpeechText(fullUserText);
    setIsEditingSpeech(true);
  };

  const handleSaveAndReEvaluate = () => {
    const newText = editedSpeechText.trim();
    setIsEditingSpeech(false);
    onSaveEditedSpeech(newText);
  };

  return (
    <div className="user-speech-box">
      <div className="mic-status-row">
        <button
          type="button"
          className={`btn-mic-toggle ${isListening ? 'listening' : ''}`}
          onClick={onToggleMic}
          title={isListening ? 'マイク停止' : 'マイク開始'}
          disabled={isRevealed}
        >
          {isListening ? <Mic size={20} className="pulse-mic" /> : <MicOff size={20} />}
        </button>
        <span className="mic-label font-medium">
          {isListening ? 'マイク起動中... 英語で発話してください' : 'マイクオフ'}
        </span>

        {/* 回答開示後で発話テキストがある場合、テキスト修正ボタン */}
        {isRevealed && !isEditingSpeech && fullUserText && (
          <button
            type="button"
            className="btn-edit-speech"
            onClick={handleStartEditSpeech}
            title="認識テキストを修正して再評価"
          >
            <Edit2 size={13} /> 修正
          </button>
        )}
      </div>

      {isEditingSpeech ? (
        <div className="speech-edit-form mt-2">
          <input
            type="text"
            className="speech-edit-input"
            value={editedSpeechText}
            onChange={(e) => setEditedSpeechText(e.target.value)}
            placeholder="話した英語を入力・修正..."
            autoFocus
          />
          <div className="speech-edit-actions">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleSaveAndReEvaluate}
            >
              <Check size={14} /> 確定してAI再評価
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setIsEditingSpeech(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="speech-transcript-text">
          {fullUserText ? (
            <span>
              {userTranscript}{' '}
              <span className="interim-text">{interimTranscript}</span>
            </span>
          ) : (
            <span className="placeholder-text">
              {isListening ? 'あなたの発話を待っています...' : '（マイクを押すか、頭の中で英文を作って「答え合わせ」を押してください）'}
            </span>
          )}
        </div>
      )}

      {speechError && <div className="speech-error-msg">{speechError}</div>}
    </div>
  );
}
