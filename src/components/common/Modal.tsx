import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  footer?: React.ReactNode;
  className?: string;
  contentStyle?: React.CSSProperties;
}

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
}: ModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
