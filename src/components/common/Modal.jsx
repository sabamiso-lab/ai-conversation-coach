import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * 汎用モーダルコンポーネント
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - 表示フラグ
 * @param {() => void} props.onClose - 閉じるコールバック
 * @param {React.ReactNode} [props.title] - モーダルタイトル
 * @param {React.ReactNode} [props.icon] - タイトル横に表示するアイコン
 * @param {React.ReactNode} props.children - モーダルコンテンツ
 * @param {string} [props.maxWidth='520px'] - 最大幅
 * @param {boolean} [props.closeOnOverlayClick=true] - オーバーレイクリックで閉じるか
 * @param {boolean} [props.closeOnEsc=true] - ESCキー押下で閉じるか
 * @param {React.ReactNode} [props.footer] - フッター領域
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.contentStyle] - コンテンツのインラインスタイル
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = '520px',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer,
  className = '',
  contentStyle = {}
}) {
  const handleKeyDown = useCallback((e) => {
    if (closeOnEsc && e.key === 'Escape') {
      onClose?.();
    }
  }, [closeOnEsc, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className={`modal-overlay ${className}`.trim()}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        style={{ maxWidth, ...contentStyle }}
      >
        {(title || icon || onClose) && (
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {icon}
              {title && <h2 className="modal-title">{title}</h2>}
            </div>
            {onClose && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                aria-label="閉じる"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {children}

        {footer && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
