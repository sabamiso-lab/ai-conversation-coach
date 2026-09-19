import React from 'react';
import { Award } from 'lucide-react';
import FeedbackGrid from '../../components/common/FeedbackGrid';

/**
 * シャドーイング AI評価結果カード（スコア、講評、良かった点・改善点グリッド）
 * @param {Object} props
 * @param {Object} props.evalResult - 評価結果
 * @param {number} props.evalResult.score - 評価スコア (0-100)
 * @param {string} props.evalResult.feedbackJa - 全体講評
 * @param {string[]} [props.evalResult.strengthsJa] - 良かった点リスト
 * @param {string[]} [props.evalResult.improvementsJa] - 改善ポイントリスト
 * @param {string} [props.className='']
 */
export default function ShadowingEvaluationCard({ evalResult, className = '' }) {
  if (!evalResult) return null;

  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
        border: '1px solid #C7D2FE',
        borderRadius: '16px',
        padding: '24px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#3730A3', fontSize: '1.05rem' }}>
          <Award size={22} color="#4F46E5" /> AI Coach 発音・シャドーイング評価
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4F46E5' }}>
          {evalResult.score}<span style={{ fontSize: '1rem', color: '#6366F1' }}>点</span>
        </div>
      </div>

      <p style={{ fontSize: '0.92rem', color: '#1E1B4B', lineHeight: 1.6, marginBottom: '16px', background: '#FFFFFF', padding: '14px', borderRadius: '12px' }}>
        💬 {evalResult.feedbackJa}
      </p>

      <FeedbackGrid
        className="shadowing-eval-grid"
        strengths={evalResult.strengthsJa}
        improvements={evalResult.improvementsJa}
        strengthsTitle="👍 良かった点"
        improvementsTitle="🎯 さらに良くするポイント"
        minColWidth="240px"
        compact
      />
    </div>
  );
}
