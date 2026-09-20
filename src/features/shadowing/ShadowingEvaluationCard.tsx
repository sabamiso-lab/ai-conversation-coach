import React from 'react';
import SpeechEvaluationCard from '../../components/common/SpeechEvaluationCard';
import type { ShadowingEvaluation } from '../../types';

export interface ShadowingEvaluationCardProps {
  evalResult?: ShadowingEvaluation | null;
  className?: string;
}

/**
 * シャドーイング AI評価結果カード（スコア、講評、良かった点・改善点グリッド）
 */
export default function ShadowingEvaluationCard({ evalResult, className = '' }: ShadowingEvaluationCardProps) {
  if (!evalResult) return null;

  return (
    <SpeechEvaluationCard
      title="AI Coach 発音・シャドーイング評価"
      score={evalResult.score}
      feedbackJa={evalResult.feedbackJa}
      strengths={evalResult.strengthsJa}
      improvements={evalResult.improvementsJa}
      className={className}
    />
  );
}
