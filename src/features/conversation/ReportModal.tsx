import React from 'react';
import { Award, BookOpen, RotateCcw } from 'lucide-react';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import Alert from '../../components/common/Alert';
import FeedbackGrid from '../../components/common/FeedbackGrid';
import type { SessionReport } from '../../types';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: SessionReport | null;
  loading?: boolean;
  error?: string | null;
  onRestart?: () => void;
  onRetry?: () => void;
}

export default function ReportModal({ 
  isOpen, 
  onClose, 
  report, 
  loading = false, 
  error, 
  onRestart, 
  onRetry 
}: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="会話セッション診断レポート"
      icon={<Award size={24} color="#4F46E5" />}
      maxWidth="640px"
    >
      {loading ? (
        <LoadingState
          icon="sparkles"
          iconSize={36}
          message="会話データをAIが分析中..."
          subMessage="文法正確さ・語彙の多様性・対話の流れを総合評価しています。"
        />
      ) : error ? (
        <div style={{ padding: '24px 12px' }}>
          <Alert
            variant="error"
            title="評価レポートの作成に失敗しました"
            style={{ marginBottom: '20px' }}
          >
            {error}
          </Alert>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '24px', lineHeight: 1.6, textAlign: 'center' }}>
            画面右上の <strong>「API Key 設定」</strong> から Gemini API Key やモデル設定が正しいかご確認ください。
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              閉じる
            </button>
            {onRetry && (
              <button className="btn btn-primary" onClick={onRetry}>
                <RotateCcw size={16} /> 再試行
              </button>
            )}
          </div>
        </div>
      ) : report ? (
        <div>
          {/* Overall Score Banner */}
          <div className="report-hero-banner">
            <div className="report-hero-label">
              OVERALL PERFORMANCE
            </div>
            <div className="report-hero-score">
              {report.overallScore}<span className="report-hero-score-unit">/100</span>
            </div>
            <div className="report-hero-msg">
              {report.overallScore >= 80 ? '🌟 素晴らしいコミュニケーション力です！' : '👍 よく頑張りました！着実に成長しています。'}
            </div>
          </div>

          {/* Score Grid */}
          <div className="report-grid">
            <div className="score-card">
              <div className="score-num">{report.grammarScore}</div>
              <div className="score-label">Grammar (文法)</div>
            </div>
            <div className="score-card">
              <div className="score-num">{report.vocabScore}</div>
              <div className="score-label">Vocabulary (語彙)</div>
            </div>
            <div className="score-card">
              <div className="score-num">{report.fluencyScore}</div>
              <div className="score-label">Fluency (流れ)</div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="report-summary-box">
            <div className="report-summary-title">
              📝 AIコーチからのアドバイス
            </div>
            <p className="report-summary-text">
              {report.summaryJa}
            </p>
          </div>

          {/* Strengths & Improvements */}
          <FeedbackGrid
            strengths={report.strengthsJa}
            improvements={report.improvementsJa}
            strengthsTitle="💪 良かった点"
            improvementsTitle="🎯 次回の改善ポイント"
            className="mb-4"
          />

          {/* Key Phrases */}
          {report.keyPhrases && report.keyPhrases.length > 0 && (
            <div className="report-key-phrases">
              <div className="report-phrases-title">
                <BookOpen size={18} color="#4F46E5" /> 今回学んだキーフレーズ
              </div>
              <div className="report-phrases-list">
                {report.keyPhrases.map((item, i) => (
                  <div key={i} className="report-phrase-item">
                    <span className="report-phrase-en">{item.phrase}</span>
                    <span className="report-phrase-ja">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="report-actions-row">
            <button className="btn btn-secondary" onClick={onClose}>
              閉じる
            </button>
            {onRestart && (
              <button className="btn btn-primary" onClick={onRestart}>
                <RotateCcw size={16} /> 別のシチュエーションを試す
              </button>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
