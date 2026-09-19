import React, { useState } from 'react';
import { PRESET_BLITZ_TOPICS } from './blitzTopics';
import { Zap, Briefcase, Smile, Sparkles, Clock, Mic, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function BlitzTopicSelector({
  onStartSession,
  onGenerateCustom,
  isGenerating,
  hasApiKey,
  onOpenApiKeyModal
}) {
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [timerSeconds, setTimerSeconds] = useState(5); // 3, 5, 7, 0 (no limit)

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Zap': return <Zap className="topic-icon-svg text-yellow-500" size={24} />;
      case 'Briefcase': return <Briefcase className="topic-icon-svg text-blue-500" size={24} />;
      case 'Smile': return <Smile className="topic-icon-svg text-green-500" size={24} />;
      default: return <Zap className="topic-icon-svg" size={24} />;
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    if (!hasApiKey) {
      onOpenApiKeyModal();
      return;
    }
    onGenerateCustom({
      topicPrompt: customTopic.trim(),
      difficulty,
      timerSeconds
    });
  };

  return (
    <div className="blitz-selector-container">
      {/* ヒーローヘッダー */}
      <div className="blitz-hero-header">
        <div className="hero-badge">
          <Zap size={16} /> <span>大量インプット ✕ 超高速発話</span>
        </div>
        <h1 className="hero-title">⚡ 瞬間英作文 ＆ パターンプラクティス</h1>
        <p className="hero-subtitle">
          日本語のメッセージを見て、1〜5秒以内に即座に英語で発話！<br />
          文法を考える隙を与えず、使える構文と表現パターンを脳に爆速で叩き込みます。
        </p>
      </div>

      {/* 設定・タイマー選択 */}
      <div className="blitz-config-card">
        <div className="config-title">
          <Clock size={18} /> <span>タイマー設定 (制限時間)</span>
        </div>
        <div className="timer-options">
          {[
            { sec: 3, label: '⚡ 3秒 (超高速)', desc: '上級者向け・瞬発力特訓' },
            { sec: 5, label: '⏱️ 5秒 (標準)', desc: 'テンポよく即答' },
            { sec: 7, label: '🌱 7秒 (じっくり)', desc: 'ゆっくり確実に発話' },
            { sec: 0, label: '♾️ 制限時間なし', desc: '自分のペースで' }
          ].map((option) => (
            <button
              key={option.sec}
              type="button"
              className={`timer-chip ${timerSeconds === option.sec ? 'active' : ''}`}
              onClick={() => setTimerSeconds(option.sec)}
            >
              <div className="chip-label">{option.label}</div>
              <div className="chip-desc">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* プリセットトピック一覧 */}
      <div className="blitz-section-title">
        <h3>📚 プリセット問題集</h3>
      </div>
      <div className="blitz-presets-grid">
        {PRESET_BLITZ_TOPICS.map((topic) => (
          <div key={topic.id} className="blitz-topic-card">
            <div className="topic-card-header">
              <div className="topic-icon-badge">
                {getIconComponent(topic.icon)}
              </div>
              <div className="topic-category-tag">{topic.category}</div>
            </div>
            <h4 className="topic-card-title">{topic.title}</h4>
            <p className="topic-card-desc">{topic.description}</p>

            <div className="topic-card-footer">
              <span className="question-count-badge">{topic.questions.length} 問</span>
              <button
                className="btn btn-primary btn-sm btn-blitz-start"
                onClick={() => onStartSession(topic.questions, topic.title, timerSeconds)}
              >
                スタート <Zap size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI動的生成お題 */}
      <div className="blitz-section-title mt-8">
        <h3>✨ Gemini AI でオリジナル英作文セットを生成</h3>
      </div>
      <div className="blitz-custom-card">
        <div className="custom-card-header">
          <Sparkles className="text-purple-500" size={24} />
          <div>
            <h4>自由なお題で問題を作成</h4>
            <p className="text-sm text-sub">自分の職業や興味に合わせた英作文10問セットを生成します。</p>
          </div>
        </div>

        <form onSubmit={handleCustomSubmit} className="custom-form">
          <div className="form-group">
            <label>生成したいトピック / シチュエーション</label>
            <input
              type="text"
              className="input-field"
              placeholder="例: ITエンジニアのデイリースクラム、海外ホテルでのトラブル対応、レストランの予約など"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>難易度</label>
              <select
                className="input-field select-field"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isGenerating}
              >
                <option value="Beginner">🌱 初級 (基礎的な表現)</option>
                <option value="Intermediate">⚡ 中級 (実践的な表現)</option>
                <option value="Advanced">🔥 上級 (洗練された表現・複文)</option>
              </select>
            </div>

            <div className="form-group button-group">
              <button
                type="submit"
                className="btn btn-purple btn-block"
                disabled={isGenerating || !customTopic.trim()}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner-sm" /> 10問セット作成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> AI英作文セットを生成
                  </>
                )}
              </button>
            </div>
          </div>

          {!hasApiKey && (
            <div className="api-key-warning-inline mt-3" onClick={onOpenApiKeyModal}>
              <ShieldAlert size={16} /> <span>AI動的生成を利用するには API Key の設定が必要です (クリックして設定)</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
