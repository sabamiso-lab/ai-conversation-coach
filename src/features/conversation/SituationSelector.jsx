import React, { useState, useEffect } from 'react';
import { fetchSituations, createSituation } from '../../services/api';
import { generateNewsSituation } from '../../services/gemini';
import { 
  Coffee, Plane, Building, Briefcase, Award, MessageSquare, 
  ArrowRight, Target, Loader2, Globe, 
  ExternalLink, Zap, Newspaper
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CategoryFilter from '../../components/common/CategoryFilter';
import LoadingState from '../../components/common/LoadingState';
import DifficultyBadge from '../../components/common/DifficultyBadge';
import AiGeneratorCard from '../../components/common/AiGeneratorCard';
import Alert from '../../components/common/Alert';

const ICON_MAP = {
  Coffee,
  Plane,
  Building,
  Briefcase,
  Award,
  MessageSquare,
  Globe,
  Zap,
  Newspaper
};

const NEWS_CATEGORIES = [
  { id: 'tech', label: '🚀 Tech & AI', category: 'Technology' },
  { id: 'business', label: '💼 Business', category: 'Business' },
  { id: 'world', label: '🌍 World News', category: 'Global News' },
  { id: 'science', label: '🎬 Culture & Science', category: 'Entertainment and Science' }
];

const NEWS_DIFFICULTIES = [
  { id: 'Beginner', label: '🌱 初級 (Beginner)', desc: '平易な語彙・短文で要約', badgeBg: '#10B981' },
  { id: 'Intermediate', label: '⚡ 中級 (Intermediate)', desc: '標準ニュースレベル', badgeBg: '#F59E0B' },
  { id: 'Advanced', label: '🔥 上級 (Advanced)', desc: '高度語彙・深掘り議論', badgeBg: '#8B5CF6' }
];

export default function SituationSelector({ onSelectSituation, apiKey, model, onOpenApiKeyModal }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [situations, setSituations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Accordion & Custom Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customNewsTopic, setCustomNewsTopic] = useState('');

  // News Grounding Generator States
  const [newsDifficulty, setNewsDifficulty] = useState('Intermediate');
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [generatingCategory, setGeneratingCategory] = useState(null);
  const [newsProgressMsg, setNewsProgressMsg] = useState('');
  const [newsError, setNewsError] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    async function loadSituations() {
      setIsLoading(true);
      const { data } = await fetchSituations();
      if (isMounted) {
        setSituations(data);
        setIsLoading(false);
      }
    }

    loadSituations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle News Scenario Generation (One-Tap or Custom Topic Search)
  const handleGenerateNews = async (catItem, customTopic = '') => {
    if (!apiKey) {
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsGeneratingNews(true);
    const catId = typeof catItem === 'object' ? catItem.id : 'custom';
    const catName = typeof catItem === 'object' ? catItem.category : 'General News';
    setGeneratingCategory(catId);

    const targetLabel = customTopic.trim() || (typeof catItem === 'object' ? catItem.label : 'ニュース');
    const selectedDiffObj = NEWS_DIFFICULTIES.find(d => d.id === newsDifficulty);
    setNewsProgressMsg(`Google検索で${targetLabel}のニュース（${selectedDiffObj ? selectedDiffObj.label : newsDifficulty}向け）を調査中...`);
    setNewsError('');

    try {
      const newSituation = await generateNewsSituation({
        apiKey,
        model,
        category: catName,
        topic: customTopic.trim(),
        difficulty: newsDifficulty,
        onProgressStatus: (msg) => setNewsProgressMsg(msg)
      });

      // Insert new news scenario at top of list
      setSituations((prev) => [newSituation, ...prev]);
      setCustomNewsTopic('');
      setIsFormOpen(false);

      // Optionally attempt storing in DynamoDB API
      createSituation(newSituation).catch((err) => console.warn('Background save note:', err.message));

    } catch (err) {
      console.error('Failed to generate news situation:', err);
      setNewsError(err.message || 'ニュースシチュエーションの生成に失敗しました。');
    } finally {
      setIsGeneratingNews(false);
      setGeneratingCategory(null);
    }
  };

  const categories = ['All', 'News & Trends', 'Daily', 'Travel', 'Business', 'Casual'];

  const filteredSituations = selectedCategory === 'All' 
    ? situations 
    : situations.filter(s => s.category === selectedCategory);

  return (
    <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Title Banner */}
      <PageHeader
        badgeIcon={<MessageSquare size={16} />}
        badgeText="Conversation Studio"
        title="英会話の訓練シチュエーションを選択"
        description="AIが指定した役柄になりきってリアルな対話を行います。実生活や仕事ですぐに使える表現力を身につけましょう。"
      />

      {/* --- Dynamic News Grounding Generator Section --- */}
      <AiGeneratorCard
        badgeText="Google Search Grounding"
        hasApiKey={Boolean(apiKey)}
        title="📰 本日のトレンドニュースからシチュエーションをAI生成"
        description="Google検索で最新ニュースを取得し、その話題について語り合う実践的なロールプレイをAIがその場で構築します。"
        isOpen={isFormOpen}
        onToggle={() => setIsFormOpen(!isFormOpen)}
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (customNewsTopic.trim()) {
              handleGenerateNews('custom', customNewsTopic);
            }
          }}
        >
            {/* Difficulty Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>
                ① 英語難易度を選択
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {NEWS_DIFFICULTIES.map((diff) => {
                  const isSelected = newsDifficulty === diff.id;
                  return (
                    <button
                      type="button"
                      key={diff.id}
                      onClick={() => setNewsDifficulty(diff.id)}
                      disabled={isGeneratingNews}
                      title={diff.desc}
                      style={{
                        background: isSelected ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'rgba(255, 255, 255, 0.08)',
                        color: '#FFFFFF',
                        border: isSelected ? '1px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: isGeneratingNews ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none'
                      }}
                    >
                      {diff.label}
                      <span className="sr-only" style={{ display: 'none' }}>{diff.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Input or One-Tap Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  ② 語り合ってみたいニュースキーワード・話題 (自由入力)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例: 大谷翔平の試合、Apple新製品、AI動向..."
                    value={customNewsTopic}
                    onChange={(e) => setCustomNewsTopic(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', flex: '1 1 200px', minWidth: '180px' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isGeneratingNews || !customNewsTopic.trim()}
                    style={{ padding: '9px 16px', borderRadius: '10px', whiteSpace: 'nowrap', flex: '0 0 auto' }}
                  >
                    {isGeneratingNews && generatingCategory === 'custom' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> 生成中...
                      </>
                    ) : (
                      <>
                        <Zap size={16} /> ニュースから生成
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>
                  または 定番カテゴリーからワンタップ生成:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {NEWS_CATEGORIES.map((cat) => {
                    const isThisGenerating = isGeneratingNews && generatingCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleGenerateNews(cat)}
                        disabled={isGeneratingNews}
                        style={{
                          background: isThisGenerating ? '#4338CA' : 'rgba(255, 255, 255, 0.12)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          padding: '8px 16px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: isGeneratingNews ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        {isThisGenerating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" style={{ color: '#A5B4FC' }} />
                            生成中...
                          </>
                        ) : (
                          <>
                            {cat.label}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Loading Progress Feedback */}
            {isGeneratingNews && (
              <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: '#818CF8' }} />
                <span>{newsProgressMsg || 'Geminiがニュースを読み込んでいます...'}</span>
              </div>
            )}

            {/* Error message */}
            {newsError && (
              <Alert variant="error" style={{ marginTop: '16px', marginBottom: 0 }}>
                {newsError}
              </Alert>
            )}
          </form>
      </AiGeneratorCard>

      {/* Category Tabs */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        getLabel={(cat) => cat === 'All' ? 'すべて' : cat === 'News & Trends' ? '📰 News & Trends' : cat}
      />

      {/* Loading State */}
      {isLoading ? (
        <LoadingState message="シチュエーションを読み込み中..." />
      ) : (
        /* Grid */
        <div className="situation-grid">
          {filteredSituations.map(sit => {
            const IconComponent = ICON_MAP[sit.icon] || MessageSquare;

            return (
              <div 
                key={sit.id} 
                className="situation-card"
                onClick={() => onSelectSituation(sit)}
                style={{
                  border: sit.isNews ? '2px solid #6366F1' : '1px solid #E2E8F0',
                  background: sit.isNews ? 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)' : '#FFFFFF'
                }}
              >
                <div>
                  <div className="card-top">
                    <div className="icon-box" style={{ background: sit.isNews ? '#EEF2FF' : '#F1F5F9', color: sit.isNews ? '#4F46E5' : '#475569' }}>
                      <IconComponent size={24} />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {sit.isNews && (
                        <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }}>
                          📰 News
                        </span>
                      )}
                      <DifficultyBadge difficulty={sit.difficulty} />
                    </div>
                  </div>

                  <div className="card-title">{sit.title}</div>
                  <div className="card-title-ja">{sit.titleJa}</div>

                  <p className="card-desc">
                    {sit.descriptionJa}
                  </p>

                  {/* News Citation Link if available */}
                  {sit.newsSource && (
                    <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                      <a
                        href={sit.newsSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          color: '#4F46E5',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          background: '#EEF2FF',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                        title="元ニュース記事を読む"
                      >
                        <ExternalLink size={12} /> 出典: {sit.newsSource.title.slice(0, 35)}...
                      </a>
                    </div>
                  )}

                  <div className="goals-list">
                    <div className="goals-title">
                      <Target size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      達成目標 (Goals)
                    </div>
                    {sit.goals.slice(0, 2).map((goal, i) => (
                      <div key={i} className="goal-item">
                        • {goal}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#4F46E5', fontWeight: 700, fontSize: '0.9rem' }}>
                  会話を開始する <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
