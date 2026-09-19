import React from 'react';
import { Trophy, RotateCcw, CheckCircle2, XCircle, Volume2, ArrowRight, Zap, Target, Clock } from 'lucide-react';
import { speakText } from '../../services/speech';

export default function BlitzSummary({
  summaryData,
  onRetryIncorrect,
  onRestartAll,
  onBackToSelector
}) {
  const { title, results, totalTimeSec } = summaryData;

  const totalCount = results.length;
  const correctResults = results.filter((r) => r.isCorrect);
  const incorrectResults = results.filter((r) => !r.isCorrect);
  const correctCount = correctResults.length;
  const scorePercent = Math.round((correctCount / totalCount) * 100);

  const avgTimePerQuestion = totalCount > 0
    ? (totalTimeSec / totalCount).toFixed(1)
    : 0;

  const getEvaluationMessage = (score) => {
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
          <div className="stat-card">
            <Target size={20} className="text-green-500" />
            <div className="stat-val font-mono">{correctCount} / {totalCount}</div>
            <div className="stat-lbl">正解 (言えた)</div>
          </div>

          <div className="stat-card">
            <Clock size={20} className="text-blue-500" />
            <div className="stat-val font-mono">{totalTimeSec}s</div>
            <div className="stat-lbl">合計タイム</div>
          </div>

          <div className="stat-card">
            <Zap size={20} className="text-yellow-500" />
            <div className="stat-val font-mono">{avgTimePerQuestion}s</div>
            <div className="stat-lbl">平均応答速度 / 問</div>
          </div>
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

                <button
                  className="btn btn-icon btn-secondary btn-xs"
                  onClick={() => speakText(item.question.answer)}
                  title="模範音声を再生"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div className="item-body mt-2">
                <div className="prompt-text">🇯🇵 {item.question.prompt}</div>
                <div className="answer-text">🇺🇸 {item.question.answer}</div>

                {item.userSpeech && (
                  <div className="user-speech-text mt-1 text-xs">
                    🗣️ あなたの発話: <span className="font-mono">"{item.userSpeech}"</span>
                    {item.matchScore > 0 && (
                      <span className="match-score-tag ml-2 font-mono">({item.matchScore}% 一致)</span>
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
