import React from 'react';
import { Trophy, RotateCcw, CheckCircle2, XCircle, Zap, Target, Clock, Sparkles } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import AudioPlayButton from '../../components/common/AudioPlayButton';
import type { BlitzQuestion, BlitzSessionSummaryData } from '../../types';

export interface BlitzSummaryProps {
  summaryData: BlitzSessionSummaryData;
  onRetryIncorrect: (questions: BlitzQuestion[]) => void;
  onRestartAll: () => void;
  onBackToSelector: () => void;
}

export default function BlitzSummary({
  summaryData,
  onRetryIncorrect,
  onRestartAll,
  onBackToSelector
}: BlitzSummaryProps) {
  const title = summaryData.title || summaryData.topicTitle || '';
  const results = summaryData.results || [];
  const totalTime = Number(summaryData.totalDurationSec ?? summaryData.totalTimeSec ?? 0);

  const totalCount = results.length;
  const correctResults = results.filter((r) => r.isCorrect);
  const incorrectResults = results.filter((r) => !r.isCorrect);
  const correctCount = correctResults.length;
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const avgTimePerQuestion = summaryData.avgResponseTimeSec !== undefined
    ? Number(summaryData.avgResponseTimeSec).toFixed(1)
    : totalCount > 0
    ? (totalTime / totalCount).toFixed(1)
    : '0.0';

  const aiEvaluatedResults = results.filter((r) => r.aiEvaluation && typeof r.aiEvaluation.score === 'number');
  const avgAiScore = aiEvaluatedResults.length > 0
    ? Math.round(aiEvaluatedResults.reduce((acc, r) => acc + (r.aiEvaluation?.score || 0), 0) / aiEvaluatedResults.length)
    : null;

  const getEvaluationMessage = (score: number) => {
    if (score === 100) return '🎉 素晴らしい！全問即答クリアです！構文が頭にしっかり定着しています。';
    if (score >= 80) return '🔥 素晴らしい反射神経です！この調子で発話のスピード感を維持しましょう。';
    if (score >= 50) return '👍 ナイスチャレンジ！間違えた問題を復習して口に馴染ませましょう。';
    return '💪 伸び代たっぷりです！何度も反復して、考えずに口から出るまで練習しましょう。';
  };

  return (
    <div className="blitz-summary-container">
      {/* ヒーロー診断ボード */}
      <div className="summary-hero-card">
        <div className="trophy-badge">
          <Trophy size={36} className="text-yellow-400" />
        </div>
        <h2 className="summary-title">Blitz セッション完了！</h2>
        <p className="summary-topic-name">【{title}】</p>

        <div className="score-display-row mt-4">
          <div className="score-main font-mono">
            {scorePercent}<span className="score-unit">%</span>
          </div>
        </div>

        <p className="evaluation-msg mt-2">{getEvaluationMessage(scorePercent)}</p>

        {/* スタッツグリッド */}
        <div className="summary-stats-grid mt-6">
          <StatCard
            icon={<Target size={20} className="text-green-500" />}
            value={`${correctCount} / ${totalCount}`}
            label="正解 (言えた)"
          />
          {avgAiScore !== null ? (
            <StatCard
              icon={<Sparkles size={20} className="text-indigo-500" />}
              value={`${avgAiScore}点`}
              label={`AI平均スコア (${aiEvaluatedResults.length}問)`}
            />
          ) : (
            <StatCard
              icon={<Clock size={20} className="text-blue-500" />}
              value={`${totalTime}s`}
              label="合計タイム"
            />
          )}
          <StatCard
            icon={<Zap size={20} className="text-yellow-500" />}
            value={`${avgTimePerQuestion}s`}
            label="平均応答速度 / 問"
          />
        </div>

        {/* アクションボタン */}
        <div className="summary-actions-row mt-6">
          {incorrectResults.length > 0 && (
            <button
              className="btn btn-warning btn-lg flex-1"
              onClick={() => onRetryIncorrect(incorrectResults.map((r) => r.question))}
            >
              <RotateCcw size={18} /> 言えなかった{incorrectResults.length}問をリトライ
            </button>
          )}

          <button
            className="btn btn-primary btn-lg flex-1"
            onClick={onRestartAll}
          >
            <Zap size={18} /> 最初からもう一度
          </button>

          <button
            className="btn btn-secondary btn-lg"
            onClick={onBackToSelector}
          >
            お題一覧へ戻る
          </button>
        </div>
      </div>

      {/* 問題ごとの振り返りリスト */}
      <div className="summary-details-section mt-8">
        <h3>📖 全問題の振り返り ({totalCount}問)</h3>

        <div className="results-list mt-4">
          {results.map((item, idx) => (
            <div
              key={item.questionId || idx}
              className={`result-item-card ${item.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="item-header">
                <div className="item-status">
                  {item.isCorrect ? (
                    <span className="badge badge-success"><CheckCircle2 size={14} /> 言えた</span>
                  ) : (
                    <span className="badge badge-danger"><XCircle size={14} /> 言えなかった</span>
                  )}
                  <span className="item-num font-mono">Q{idx + 1}</span>
                </div>

                <AudioPlayButton
                  text={item.question.answer}
                  variant="icon"
                  className="btn btn-icon btn-secondary btn-xs"
                  title="模範音声を再生"
                  iconSize={16}
                />
              </div>

              <div className="item-body mt-2">
                <div className="prompt-text">🇯🇵 {item.question.prompt}</div>
                <div className="answer-text">🇺🇸 {item.question.answer}</div>

                {item.userSpeech && (
                  <div className="user-speech-text mt-1 text-xs">
                    🗣️ あなたの発話: <span className="font-mono">"{item.userSpeech}"</span>
                    {(item.matchScore ?? 0) > 0 && (
                      <span className="match-score-tag ml-2 font-mono">({item.matchScore}% 一致)</span>
                    )}
                  </div>
                )}

                {/* AI 評価詳細 */}
                {item.aiEvaluation && (
                  <div className={`summary-ai-eval-box mt-3 status-${(item.aiEvaluation.status || '').toLowerCase()}`}>
                    <div className="summary-ai-header">
                      <div className="summary-ai-badge-group">
                        <Sparkles size={14} className="text-indigo-600" />
                        <span className="summary-ai-label font-bold">AI発話判定:</span>
                        <span className={`ai-status-badge badge-${(item.aiEvaluation.status || '').toLowerCase()}`}>
                          {item.aiEvaluation.statusLabelJa || (item.aiEvaluation.isCorrect ? '合格' : '要復習')}
                        </span>
                      </div>
                      {typeof item.aiEvaluation.score === 'number' && (
                        <span className="summary-ai-score font-mono font-bold">
                          {item.aiEvaluation.score}点
                        </span>
                      )}
                    </div>

                    {(item.aiEvaluation.evaluationJa || item.aiEvaluation.feedbackJa) && (
                      <p className="summary-ai-comment mt-1 text-xs">
                        {item.aiEvaluation.evaluationJa || item.aiEvaluation.feedbackJa}
                      </p>
                    )}

                    {(item.aiEvaluation.improvedSpeech || item.aiEvaluation.improvedAnswer) &&
                      (item.aiEvaluation.improvedSpeech || item.aiEvaluation.improvedAnswer) !== item.userSpeech && (
                      <div className="summary-ai-improved mt-1 text-xs">
                        <span className="font-semibold text-sub">✍️ 添削例: </span>
                        <span className="font-mono text-primary">"{item.aiEvaluation.improvedSpeech || item.aiEvaluation.improvedAnswer}"</span>
                      </div>
                    )}
                  </div>
                )}

                {item.question.explanation && (
                  <div className="explanation-text mt-2 text-xs text-sub">
                    💡 {item.question.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
