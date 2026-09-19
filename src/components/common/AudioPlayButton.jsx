import React from 'react';
import { Volume2 } from 'lucide-react';
import { speakText } from '../../services/speech';

/**
 * 英文テキスト読み上げ (TTS) ボタンコンポーネント
 * @param {Object} props
 * @param {string} props.text - 再生する英文テキスト
 * @param {number} [props.rate=0.95] - 再生速度
 * @param {string} [props.lang='en-US'] - 言語コード
 * @param {'button' | 'icon'} [props.variant='button'] - ボタン形式 ('button': ラベル付き, 'icon': アイコンのみ)
 * @param {string} [props.label='聴く'] - ボタンラベル (variant='button' 時)
 * @param {number} [props.iconSize=16] - アイコンのサイズ
 * @param {string} [props.title='音声を聞く'] - ツールチップ
 * @param {string} [props.className=''] - クラス名
 * @param {React.CSSProperties} [props.style] - インラインスタイル
 * @param {Function} [props.onClick] - クリック時の追加コールバック
 * @param {boolean} [props.disabled=false] - 無効化フラグ
 */
export default function AudioPlayButton({
  text,
  rate = 0.95,
  lang = 'en-US',
  variant = 'button',
  label = '聴く',
  iconSize = 16,
  title = '音声を聞く',
  className = '',
  style = {},
  onClick,
  disabled = false
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (!text || disabled) return;
    speakText(text, { rate, lang });
    if (onClick) {
      onClick(e);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={handleClick}
        title={title}
        disabled={disabled}
        aria-label={title}
      >
        <Volume2 size={iconSize} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      onClick={handleClick}
      title={title}
      disabled={disabled}
      aria-label={title}
    >
      <Volume2 size={iconSize} />
      {label && <span>{label}</span>}
    </button>
  );
}
