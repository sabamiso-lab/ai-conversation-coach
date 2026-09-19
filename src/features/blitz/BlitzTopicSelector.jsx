import React, { useState } from 'react';
import { PRESET_BLITZ_TOPICS, getRandomBlitzTopic, POPULAR_BLITZ_TOPIC_CHIPS } from './blitzTopics';
import { 
  Zap, Briefcase, Smile, Sparkles, Clock, Loader2, 
  PlusCircle, Dices
} from 'lucide-react';

const CATEGORIES = ['All', 'Grammar', 'Business', 'Daily'];

const DIFFICULTIES = [
  { id: 'Beginner', label: '🌱 初級 (Beginner)' },
  { id: 'Intermediate', label: '⚡ 中級 (Intermediate)' },
  { id: 'Advanced', label: '🔥 上級 (Advanced)' }
];

const TIMER_OPTIONS = [
  { sec: 3, label: '⚡ 3秒 (超高速)', desc: '上級者向け・瞬発力特訓' },
  { sec: 5, label: '⏱️ 5秒 (標準)', desc: 'テンポよく即答' },
  { sec: 7, label: '🌱 7秒 (じっくり)', desc: 'ゆっくり確実に発話' },
  { sec: 0, label: '♾️ 制限なし', desc: '自分のペースで' }
];

export default function BlitzTopicSelector({
  onStartSession,
  onGenerateCustom,
  isGenerating,
  hasApiKey,
  onOpenApiKeyModal
}) {
  const [topics] = useState(PRESET_BLITZ_TOPICS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timerSeconds, setTimerSeconds] = useState(5);

  // Custom AI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState('Intermediate');

  const handleRandomizeTopic = () => {
    const randomTopic = getRandomBlitzTopic();
    setCustomTopic(randomTopic);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!hasApiKey) {
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    onGenerateCustom({
      topicPrompt: customTopic.trim() || 'おまかせ',
      difficulty: customDifficulty,
      timerSeconds
    });
  };

  const filteredTopics = selectedCategory === 'All'
    ? topics
    : topics.filter(t => t.category === selectedCategory);

  return (
    <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Title Banner */}
      <div style={{ textAlign: 'center', marginBottom: '24px', padding: '0 8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EEF2FF', color: '#4F46E5', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px' }}>
          <Zap size={16} /> Oral Blitz Studio
        </div>
        <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          瞬間英作文・パターンプラクティス
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '8px', maxWidth: '640px', margin: '8px auto 0 auto', lineHeight: 1.5 }}>
          日本語のメッセージを見て、1〜5秒以内に即座に英語で発話！文法を考える隙を与えず、使える構文と表現パターンを脳に爆速で叩き込みます。
        </p>
      </div>

      {/* AI Custom Script Generator Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
          borderRadius: '16px',
          padding: '20px',
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.25)', color: '#A5B4FC', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
              <Sparkles size={13} /> Gemini AI カスタム作成
              {!hasApiKey && (
                <span style={{ background: '#F59E0B', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', marginLeft: '4px' }}>
                  ⚠️ Key未設定
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              自由なお題でオリジナル瞬間英作文10問セットを生成
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
              「ITエンジニアのスクラム」「海外ホテルのトラブル」など自由入力または🎲ランダム設定で作成できます。
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setIsFormOpen(!isFormOpen)}
            style={{ borderRadius: '12px', padding: '9px 16px', fontSize: '0.88rem', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
          >
            <PlusCircle size={18} /> {isFormOpen ? '閉じる' : 'AIで作成する'}
          </button>
        </div>

        {/* Custom AI Form Collapse */}
        {isFormOpen && (
          <form onSubmit={handleCustomSubmit} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1' }}>
                    生成したいトピック / シチュエーション
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeTopic}
                    style={{
                      background: 'rgba(99, 102, 241, 0.3)',
                      color: '#E0E7FF',
                      border: '1px solid rgba(165, 180, 252, 0.4)',
                      borderRadius: '8px',
                      padding: '3px 9px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    title="おすすめトピックをランダムにセット"
                  >
                    <Dices size={14} /> 🎲 ランダムに選ぶ
                  </button>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: ITスクラム、海外旅行のトラブル... (空欄でおまかせ)"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  disabled={isGenerating}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', width: '100%' }}
                />

                {/* Popular Topic Chips */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>話題例:</span>
                  {POPULAR_BLITZ_TOPIC_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomTopic(chip.topic)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.07)',
                        color: '#CBD5E1',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  難易度
                </label>
                <select
                  className="input-field"
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value)}
                  disabled={isGenerating}
                  style={{ background: '#1E293B', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating}
                style={{ padding: '9px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> 10問セット作成中...
                  </>
                ) : !customTopic.trim() ? (
                  <>
                    <Dices size={16} /> 🎲 おまかせで10問セット生成
                  </>
                ) : (
                  <>
                    <Zap size={16} /> AI英作文セットを生成
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Timer Bar / Configuration Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px 20px', border: '1px solid #E2E8F0', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
          <Clock size={16} style={{ color: '#4F46E5' }} /> ⏱️ 発話制限時間 (タイマー設定)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {TIMER_OPTIONS.map((option) => {
            const isSelected = timerSeconds === option.sec;
            return (
              <button
                key={option.sec}
                type="button"
                onClick={() => setTimerSeconds(option.sec)}
                style={{
                  background: isSelected ? '#EEF2FF' : '#F8FAFC',
                  border: isSelected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.12)' : 'none'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: isSelected ? '#4F46E5' : '#0F172A' }}>
                  {option.label}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                  {option.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ borderRadius: '9999px', padding: '8px 20px', fontSize: '0.88rem' }}
          >
            {cat === 'All' ? 'すべて' : cat}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="situation-grid">
        {filteredTopics.map(topic => {
          const badgeStyle = topic.difficulty === 'Beginner'
            ? { bg: '#ECFDF5', color: '#047857' }
            : topic.difficulty === 'Advanced'
            ? { bg: '#F3E8FF', color: '#6B21A8' }
            : { bg: '#FEF3C7', color: '#B45309' };

          const IconComponent = topic.icon === 'Briefcase' ? Briefcase : topic.icon === 'Smile' ? Smile : Zap;

          return (
            <div
              key={topic.id}
              className="situation-card"
              onClick={() => onStartSession(topic.questions, topic.title, timerSeconds)}
              style={{
                border: topic.category === 'Custom AI' ? '2px solid #6366F1' : '1px solid #E2E8F0',
                background: topic.category === 'Custom AI' ? 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)' : '#FFFFFF'
              }}
            >
              <div>
                <div className="card-top">
                  <div className="icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                    <IconComponent size={24} />
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className="badge" style={{ background: '#F1F5F9', color: '#475569', fontWeight: 700 }}>
                      {topic.questions ? `${topic.questions.length}問` : '10問'}
                    </span>
                    {topic.difficulty && (
                      <span 
                        className="badge" 
                        style={{ background: badgeStyle.bg, color: badgeStyle.color, fontWeight: 700 }}
                      >
                        {topic.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-title">{topic.title}</div>
                <div className="card-title-ja">{topic.titleJa || topic.category}</div>

                <p className="card-desc" style={{ WebkitLineClamp: 2 }}>
                  {topic.description}
                </p>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartSession(topic.questions, topic.title, timerSeconds);
                  }}
                >
                  瞬間英作文を開始 <Zap size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
