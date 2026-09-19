import React from 'react';
import { Award, BookOpen, RotateCcw } from 'lucide-react';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import Alert from '../../components/common/Alert';

export default function ReportModal({ isOpen, onClose, report, loading, error, onRestart, onRetry }) {
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
            <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', color: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                OVERALL PERFORMANCE
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, margin: '8px 0' }}>
                {report.overallScore}<span style={{ fontSize: '1.5rem', opacity: 0.8 }}>/100</span>
              </div>
              <div style={{ fontSize: '0.92rem', opacity: 0.95 }}>
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
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px', color: '#0F172A' }}>
                📝 AIコーチからのアドバイス
              </div>
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                {report.summaryJa}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '14px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#047857', marginBottom: '8px' }}>
                  💪 良かった点
                </div>
                {report.strengthsJa?.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', color: '#065F46', marginTop: '4px' }}>
                    • {s}
                  </div>
                ))}
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '14px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#B45309', marginBottom: '8px' }}>
                  🎯 次回の改善ポイント
                </div>
                {report.improvementsJa?.map((imp, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', color: '#92400E', marginTop: '4px' }}>
                    • {imp}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Phrases */}
            {report.keyPhrases?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={18} color="#4F46E5" /> 今回学んだキーフレーズ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {report.keyPhrases.map((item, i) => (
                    <div key={i} style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 700, color: '#4F46E5' }}>{item.phrase}</span>
                      <span style={{ color: '#475569' }}>{item.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '10px', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                閉じる
              </button>
              <button className="btn btn-primary" onClick={onRestart}>
                <RotateCcw size={16} /> 別のシチュエーションを試す
              </button>
            </div>
          </div>
        ) : null}
    </Modal>
  );
}
