import React from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * 音声録音（マイク）トグルボタンコンポーネント
 * 
 * @param {Object} props
 * @param {boolean} props.isRecording - 録音中かどうか
 * @param {() => void} props.onClick - クリック時のコールバック
 * @param {string} [props.title] - ツールチップテキスト
 * @param {number} [props.iconSize=24] - マイクアイコンのサイズ (px)
 * @param {boolean} [props.disabled=false] - ボタンの無効化フラグ
 * @param {string} [props.ariaLabel] - アクセシビリティ用ラベル
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - 追加スタイル
 */
export default function MicButton({
  isRecording,
  onClick,
  title,
  iconSize = 24,
  disabled = false,
  ariaLabel,
  className = '',
  style = {}
}) {
  const defaultTitle = isRecording ? '録音停止' : 'マイクで英語を話す';
  const resolvedTitle = title || defaultTitle;
  const resolvedAriaLabel = ariaLabel || resolvedTitle;

  return (
    <button
      type="button"
      className={`mic-btn ${isRecording ? 'recording' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={resolvedTitle}
      aria-label={resolvedAriaLabel}
      aria-pressed={isRecording}
      style={style}
    >
      {isRecording ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
    </button>
  );
}
