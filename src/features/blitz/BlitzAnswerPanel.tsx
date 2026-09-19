import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import AudioPlayButton from '../../components/common/AudioPlayButton';
import { BlitzQuestion } from '../../types';
import { BlitzSpeechEvaluationResult } from '../../services/ai/blitz';

export interface BlitzAnswerPanelProps {
  question: BlitzQuestion;
  aiEvaluation: BlitzSpeechEvaluationResult | null;
  onJudge: (isCorrect: boolean) => void;
}

export default function BlitzAnswerPanel({
  question,
  aiEvaluation,
  onJudge
}: BlitzAnswerPanelProps) {
  return (
    <div className="answer-reveal-section animate-fade-in mt-6">
      <div className="answer-card">
        <div className="answer-header">
          <span className="answer-label">✅ 模範解答 (Target Answer)</span>
          <AudioPlayButton
            text={question.answer}
            rate={0.95}
            variant="icon"
            className="btn btn-icon btn-secondary"
            title="ネイティブ音声再生"
            iconSize={18}
          />
        </div>
        <h3 className="answer-english-text">{question.answer}</h3>

        {question.acceptedAnswers && question.acceptedAnswers.length > 0 && (
          <div className="accepted-answers-list mt-2">
            <span className="text-xs text-sub font-semibold">他のOKな言い回し:</span>
            <ul>
              {question.acceptedAnswers.map((alt, idx) => (
                <li key={idx} className="text-xs text-sub">• {alt}</li>
              ))}
            </ul>
          </div>
        )}

        {question.explanation && (
          <div className="explanation-box mt-3">
            <p className="text-sm">📖 {question.explanation}</p>
          </div>
        )}
      </div>

      {/* 判定ボタン (言えた / 言えなかった) */}
      <div className="judgment-box mt-6">
        <div className="judgment-title">
          言えましたか？
          {aiEvaluation && (
            <span className="judgment-ai-hint text-xs ml-2">
              (AI判定: {aiEvaluation.isCorrect ? '合格 👍' : '要復習 ⚠️'})
            </span>
          )}
        </div>
        <div className="judgment-buttons-row">
          <button
            className={`btn btn-danger btn-lg flex-1 ${aiEvaluation && !aiEvaluation.isCorrect ? 'ai-recommended' : ''}`}
            onClick={() => onJudge(false)}
          >
            <XCircle size={22} /> 言えなかった... (復習)
            {aiEvaluation && !aiEvaluation.isCorrect && <span className="ai-chip ml-1">AI判定</span>}
          </button>

          <button
            className={`btn btn-success btn-lg flex-1 ${aiEvaluation && aiEvaluation.isCorrect ? 'ai-recommended' : ''}`}
            onClick={() => onJudge(true)}
          >
            <CheckCircle size={22} /> 言えた！ (次へ)
            {aiEvaluation && aiEvaluation.isCorrect && <span className="ai-chip ml-1">AI判定</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
