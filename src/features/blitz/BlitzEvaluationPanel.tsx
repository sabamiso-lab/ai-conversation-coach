import React from 'react';
import { Sparkles } from 'lucide-react';
import SpeechEvaluationCard from '../../components/common/SpeechEvaluationCard';
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
        <SpeechEvaluationCard
          isLoading
          loadingMessage="Gemini AI があなたの発話を分析・添削中..."
        />
      ) : aiEvaluation ? (
        <SpeechEvaluationCard
          title="AI 発話判定"
          score={aiEvaluation.score}
          statusLabel={aiEvaluation.statusLabelJa}
          statusVariant={aiEvaluation.status}
          feedbackJa={aiEvaluation.evaluationJa}
          improvedSpeech={aiEvaluation.improvedSpeech}
          adviceJa={aiEvaluation.grammarAdviceJa}
        />
      ) : evaluationError ? (
        <SpeechEvaluationCard
          error={evaluationError}
          onRetry={() => onRequestEvaluation(fullUserText)}
        />
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
