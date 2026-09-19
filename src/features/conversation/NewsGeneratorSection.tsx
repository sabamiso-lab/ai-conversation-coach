import React, { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import AiGeneratorCard from '../../components/common/AiGeneratorCard';
import Alert from '../../components/common/Alert';
import { generateNewsSituation } from '../../services/gemini';
import { createSituation } from '../../services/api';
import { Situation } from '../../types';

export interface NewsCategoryItem {
  id: string;
  label: string;
  category: string;
}

const NEWS_CATEGORIES: NewsCategoryItem[] = [
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

export interface NewsGeneratorSectionProps {
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
  onNewsGenerated: (newSituation: Situation) => void;
}

export function NewsGeneratorSection({
  apiKey,
  model,
  onOpenApiKeyModal,
  onNewsGenerated
}: NewsGeneratorSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customNewsTopic, setCustomNewsTopic] = useState('');
  const [newsDifficulty, setNewsDifficulty] = useState('Intermediate');
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [generatingCategory, setGeneratingCategory] = useState<string | null>(null);
  const [newsProgressMsg, setNewsProgressMsg] = useState('');
  const [newsError, setNewsError] = useState('');

  const handleGenerateNews = async (catItem: NewsCategoryItem | 'custom', customTopic = '') => {
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
        onProgressStatus: (msg: string) => setNewsProgressMsg(msg)
      });

      onNewsGenerated(newSituation);
      setCustomNewsTopic('');
      setIsFormOpen(false);

      // Optionally attempt storing in DynamoDB API in background
      createSituation(newSituation).catch((err) => console.warn('Background save note:', err.message));
    } catch (err: unknown) {
      console.error('Failed to generate news situation:', err);
      const msg = err instanceof Error ? err.message : 'ニュースシチュエーションの生成に失敗しました。';
      setNewsError(msg);
    } finally {
      setIsGeneratingNews(false);
      setGeneratingCategory(null);
    }
  };

  return (
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
                        <Loader2 size={15} className="animate-spin" />
                        <span>{cat.label} を探索中...</span>
                      </>
                    ) : (
                      <>
                        <span>{cat.label}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress & Error Messages */}
        {isGeneratingNews && newsProgressMsg && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(129, 140, 248, 0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#E0E7FF',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Loader2 size={16} className="animate-spin text-indigo-400" />
            <span>{newsProgressMsg}</span>
          </div>
        )}

        {newsError && (
          <Alert variant="error" style={{ marginTop: '12px' }}>
            {newsError}
          </Alert>
        )}
      </form>
    </AiGeneratorCard>
  );
}
