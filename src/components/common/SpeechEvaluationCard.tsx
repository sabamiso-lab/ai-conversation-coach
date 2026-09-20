import React from 'react';
import { Award, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import FeedbackGrid from './FeedbackGrid';

export interface SpeechEvaluationCardProps {
  title?: string;
  icon?: React.ReactNode;
  score?: number;
  statusLabel?: string;
  statusVariant?: 'success' | 'warning' | 'error' | 'perfect' | 'acceptable' | 'needs_work' | string;
  feedbackJa?: string;
  improvedSpeech?: string;
  adviceJa?: string;
  strengths?: string[];
  improvements?: string[];
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function SpeechEvaluationCard({
  title = 'AI Coach 発話評価',
  icon,
  score,
  statusLabel,
  statusVariant,
  feedbackJa,
  improvedSpeech,
  adviceJa,
  strengths,
  improvements,
  isLoading = false,
  loadingMessage = 'Gemini AI があなたの発話を分析・添削中...',
  error = null,
  onRetry,
  className = '',
  style = {}
}: SpeechEvaluationCardProps) {
  if (isLoading) {
    return (
      <div
        className={`ai-eval-loading-card animate-fade-in ${className}`.trim()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '16px',
          color: '#475569',
          fontSize: '0.9rem',
          ...style
        }}
      >
        <Loader2 size={18} className="animate-spin text-primary" />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`ai-eval-error-card ${className}`.trim()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#DC2626',
          fontSize: '0.86rem',
          ...style
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            className="btn btn-xs btn-secondary"
            onClick={onRetry}
            style={{ borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}
          >
            再試行
          </button>
        )}
      </div>
    );
  }

  // If no evaluation data at all, render nothing
  if (score === undefined && !feedbackJa && !statusLabel && !improvedSpeech) {
    return null;
  }

  const defaultIcon = statusLabel ? <Sparkles size={18} color="#4F46E5" /> : <Award size={20} color="#4F46E5" />;

  return (
    <div
      className={`ai-eval-result-card animate-fade-in ${className}`.trim()}
      style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
        border: '1px solid #C7D2FE',
        borderRadius: '16px',
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out',
        ...style
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#3730A3', fontSize: '1.05rem' }}>
          {icon || defaultIcon}
          <span>{title}</span>
          {statusLabel && (
            <span
              className={`ai-status-badge ${statusVariant ? `badge-${statusVariant.toLowerCase()}` : ''}`}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '8px',
                background: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE'
              }}
            >
              {statusLabel}
            </span>
          )}
        </div>

        {score !== undefined && (
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#4F46E5', fontFamily: 'monospace' }}>
            {score}<span style={{ fontSize: '0.95rem', color: '#6366F1' }}>点</span>
          </div>
        )}
      </div>

      {/* Main Feedback Comment */}
      {feedbackJa && (
        <p style={{ fontSize: '0.92rem', color: '#1E1B4B', lineHeight: 1.6, marginBottom: '12px', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(199, 210, 254, 0.5)' }}>
          💬 {feedbackJa}
        </p>
      )}

      {/* Improved Speech / Correction */}
      {improvedSpeech && (
        <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E0E7FF', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', marginBottom: '4px' }}>
            ✍️ おすすめの自然な表現・添削:
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: '#0F172A', fontWeight: 600 }}>
            "{improvedSpeech}"
          </div>
        </div>
      )}

      {/* One-point Grammar / Advice */}
      {adviceJa && (
        <div style={{ fontSize: '0.8rem', color: '#6366F1', background: '#F5F3FF', padding: '8px 12px', borderRadius: '8px', fontWeight: 600, marginBottom: '12px' }}>
          📌 {adviceJa}
        </div>
      )}

      {/* Strengths & Improvements Grid if provided */}
      {((strengths && strengths.length > 0) || (improvements && improvements.length > 0)) && (
        <FeedbackGrid
          className="speech-eval-grid"
          strengths={strengths}
          improvements={improvements}
          strengthsTitle="👍 良かった点"
          improvementsTitle="🎯 さらに良くするポイント"
          minColWidth="240px"
          compact
        />
      )}
    </div>
  );
}
