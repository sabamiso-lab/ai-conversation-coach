import React, { useState } from 'react';
import { SHADOWING_SCRIPTS } from '../../data/shadowingScripts';
import { generateShadowingScript } from '../../services/gemini';
import { getRandomShadowingTopic, POPULAR_TOPIC_CHIPS } from '../../data/shadowingTopics';
import { 
  Headphones, Sparkles, Play, Loader2, 
  Zap, PlusCircle, Dices 
} from 'lucide-react';

const CATEGORIES = ['All', 'Daily', 'Travel', 'Business', 'Tech & Trends', 'Custom AI'];

const DIFFICULTIES = [
  { id: 'Beginner', label: '🌱 初級 (Beginner)' },
  { id: 'Intermediate', label: '⚡ 中級 (Intermediate)' },
  { id: 'Advanced', label: '🔥 上級 (Advanced)' }
];

export default function ShadowingSelector({ onSelectScript, apiKey, model, onOpenApiKeyModal }) {
  const [scripts, setScripts] = useState(SHADOWING_SCRIPTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Custom AI Script Generator State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRandomizeTopic = () => {
    const randomTopic = getRandomShadowingTopic();
    setTopicInput(randomTopic);
  };

  const handleGenerateCustomScript = async (e) => {
    e.preventDefault();

    if (!apiKey) {
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const newScript = await generateShadowingScript({
        apiKey,
        model,
        topic: topicInput.trim() || 'おまかせ',
        difficulty: customDifficulty
      });

      setScripts(prev => [newScript, ...prev]);
      setTopicInput('');
      setIsFormOpen(false);
      onSelectScript(newScript);
    } catch (err) {
      console.error("Failed to generate shadowing script:", err);
      setErrorMsg(err.message || 'シャドーイングスクリプトの生成に失敗しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredScripts = selectedCategory === 'All'
    ? scripts
    : scripts.filter(s => s.category === selectedCategory);

  return (
    <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Title Banner */}
      <div style={{ textAlign: 'center', marginBottom: '24px', padding: '0 8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EEF2FF', color: '#4F46E5', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px' }}>
          <Headphones size={16} /> Shadowing Studio
        </div>
        <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          シャドーイング訓練教材を選択
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '8px', maxWidth: '640px', margin: '8px auto 0 auto', lineHeight: 1.5 }}>
          お手本音声を聴きながら直後に影のように復唱するトレーニングです。リスニング力とネイティブのイントネーション・スピード感を鍛えます。
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
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              好きなトピックで自分だけのシャドーイング文章を生成
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
              「海外での家探し」「IT業界のプレゼン」「空港でのトラブル」など、自由入力または🎲ランダム設定で作成できます。
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
          <form onSubmit={handleGenerateCustomScript} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1' }}>
                    学んでみたいトピック・シチュエーション
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
                  placeholder="例: レストランの予約、病院受診... (空欄でおまかせ)"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', width: '100%' }}
                />

                {/* Popular Topic Chips */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>話題例:</span>
                  {POPULAR_TOPIC_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopicInput(chip.topic)}
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
                  style={{ background: '#1E293B', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: '#F43F5E', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating}
                style={{ padding: '9px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> スクリプト作成中...
                  </>
                ) : !topicInput.trim() ? (
                  <>
                    <Dices size={16} /> 🎲 おまかせでスクリプト生成
                  </>
                ) : (
                  <>
                    <Zap size={16} /> スクリプト生成して練習開始
                  </>
                )}
              </button>
            </div>
          </form>
        )}
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

      {/* Scripts Grid */}
      <div className="situation-grid">
        {filteredScripts.map(script => {
          const badgeStyle = script.difficulty === 'Beginner'
            ? { bg: '#ECFDF5', color: '#047857' }
            : script.difficulty === 'Advanced'
            ? { bg: '#F3E8FF', color: '#6B21A8' }
            : { bg: '#FEF3C7', color: '#B45309' };

          return (
            <div
              key={script.id}
              className="situation-card"
              onClick={() => onSelectScript(script)}
              style={{
                border: script.category === 'Custom AI' ? '2px solid #6366F1' : '1px solid #E2E8F0',
                background: script.category === 'Custom AI' ? 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)' : '#FFFFFF'
              }}
            >
              <div>
                <div className="card-top">
                  <div className="icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                    <Headphones size={24} />
                  </div>
                  <span 
                    className="badge" 
                    style={{ background: badgeStyle.bg, color: badgeStyle.color, fontWeight: 700 }}
                  >
                    {script.difficultyLabel || script.difficulty}
                  </span>
                </div>

                <div className="card-title">{script.title}</div>
                <div className="card-title-ja">{script.titleJa}</div>

                <p className="card-desc" style={{ WebkitLineClamp: 2 }}>
                  {script.translation}
                </p>

                {script.tipsJa && (
                  <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#6366F1', background: '#F5F3FF', padding: '6px 10px', borderRadius: '8px', fontWeight: 600 }}>
                    💡 {script.tipsJa}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#4F46E5', fontWeight: 700, fontSize: '0.9rem' }}>
                シャドーイングを開始 <Play size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
