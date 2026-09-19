import React from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { BlitzSpeechEvaluationResult } from '../../services/ai/blitz';

export interface BlitzEvaluationPanelProps {
  apiKey?: string;
  fullUserText: string;
  isEvaluating: boolean;
  aiEvaluation: BlitzSpeechEvaluationResult | null;
  evaluationError: string | null;
  onRequestEvaluation: (text?: string) => void;
}

export default function BlitzEvaluationPanel({
  apiKey,
  fullUserText,
  isEvaluating,
  aiEvaluation,
  evaluationError,
  onRequestEvaluation
}: BlitzEvaluationPanelProps) {
  if (!apiKey || !fullUserText) return null;

  return (
    <div className="blitz-ai-eval-wrapper mt-4">
      {isEvaluating ? (
        <div className="ai-eval-loading-card animate-fade-in">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span>Gemini AI があなたの発話を分析・添削中...</span>
        </div>
      ) : aiEvaluation ? (
        <div className={`ai-eval-result-card animate-fade-in status-${aiEvaluation.status.toLowerCase()}`}>
          <div className="ai-eval-header">
            <div className="ai-eval-title">
              <Sparkles size={16} className="text-indigo-600" />
              <span>AI 発話判定</span>
              <span className={`ai-status-badge badge-${aiEvaluation.status.toLowerCase()}`}>
                {aiEvaluation.statusLabelJa}
              </span>
            </div>
            <div className="ai-eval-score font-mono">
              {aiEvaluation.score}<span className="score-unit-sm">点</span>
            </div>
          </div>

          {aiEvaluation.evaluationJa && (
            <p className="ai-eval-comment mt-2">
              {aiEvaluation.evaluationJa}
            </p>
          )}

          {aiEvaluation.improvedSpeech && (
            <div className="ai-improved-speech mt-2">
              <span className="improved-label">✍️ おすすめの自然な表現・添削:</span>
              <div className="improved-text font-mono">"{aiEvaluation.improvedSpeech}"</div>
            </div>
          )}

          {aiEvaluation.grammarAdviceJa && (
            <div className="ai-grammar-advice mt-2 text-xs text-sub">
              <span>📌 {aiEvaluation.grammarAdviceJa}</span>
            </div>
          )}
        </div>
      ) : evaluationError ? (
        <div className="ai-eval-error-card mt-2">
          <AlertCircle size={14} />
          <span>{evaluationError}</span>
          <button
            type="button"
            className="btn btn-xs btn-secondary ml-2"
            onClick={() => onRequestEvaluation(fullUserText)}
          >
            再試行
          </button>
        </div>
      ) : (
        <div className="ai-eval-manual-trigger mt-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => onRequestEvaluation(fullUserText)}
          >
            <Sparkles size={14} /> AI にこの発話を添削・判定してもらう
          </button>
        </div>
      )}
    </div>
  );
}
