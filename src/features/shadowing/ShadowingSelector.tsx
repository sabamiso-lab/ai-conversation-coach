import React, { useState } from 'react';
import { SHADOWING_SCRIPTS } from '../../data/shadowingScripts';
import { generateShadowingScript } from '../../services/gemini';
import { getRandomShadowingTopic, POPULAR_TOPIC_CHIPS } from '../../data/shadowingTopics';
import { Headphones, Play } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CategoryFilter from '../../components/common/CategoryFilter';
import CustomTopicGenerator from '../../components/common/CustomTopicGenerator';
import PracticeItemCard from '../../components/common/PracticeItemCard';
import { useSettings } from '../../hooks/useSettings';
import type { ShadowingScript } from '../../types';

const CATEGORIES = ['All', 'Daily', 'Travel', 'Business', 'Tech & Trends', 'Custom AI'];

export interface ShadowingSelectorProps {
  onSelectScript: (script: ShadowingScript) => void;
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
}

export default function ShadowingSelector({ 
  onSelectScript, 
  apiKey: propsApiKey, 
  model: propsModel, 
  onOpenApiKeyModal: propsOnOpenApiKeyModal 
}: ShadowingSelectorProps) {
  const settings = useSettings();
  const apiKey = propsApiKey !== undefined ? propsApiKey : (settings.apiKey || '');
  const model = propsModel !== undefined ? propsModel : (settings.model || 'gemini-3.5-flash-lite');
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;

  const [scripts, setScripts] = useState<ShadowingScript[]>(SHADOWING_SCRIPTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Custom AI Script Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerateCustomScript = async ({ topic, difficulty }: { topic: string; difficulty: string }) => {
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
        topic: topic || 'おまかせ',
        difficulty
      });

      setScripts(prev => [newScript, ...prev]);
      onSelectScript(newScript);
    } catch (err: unknown) {
      console.error("Failed to generate shadowing script:", err);
      const message = err instanceof Error ? err.message : 'シャドーイングスクリプトの生成に失敗しました。';
      setErrorMsg(message);
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
      <PageHeader
        badgeIcon={<Headphones size={16} />}
        badgeText="Shadowing Studio"
        title="シャドーイング訓練教材を選択"
        description="お手本音声を聴きながら直後に影のように復唱するトレーニングです。リスニング力とネイティブのイントネーション・スピード感を鍛えます。"
      />

      {/* AI Custom Script Generator Card */}
      <CustomTopicGenerator
        hasApiKey={Boolean(apiKey)}
        onOpenApiKeyModal={onOpenApiKeyModal}
        title="好きなトピックで自分だけのシャドーイング文章を生成"
        description="「海外での家探し」「IT業界のプレゼン」「空港でのトラブル」など、自由入力または🎲ランダム設定で作成できます。"
        topicLabel="学んでみたいトピック・シチュエーション"
        topicPlaceholder="例: レストランの予約、病院受診... (空欄でおまかせ)"
        suggestionChips={POPULAR_TOPIC_CHIPS}
        getRandomTopic={getRandomShadowingTopic}
        isGenerating={isGenerating}
        errorMsg={errorMsg}
        generatingLabel="スクリプト作成中..."
        omakaseButtonLabel="🎲 おまかせでスクリプト生成"
        customButtonLabel="スクリプト生成して練習開始"
        onSubmit={handleGenerateCustomScript}
      />

      {/* Category Tabs */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Scripts Grid */}
      <div className="situation-grid">
        {filteredScripts.map(script => (
          <PracticeItemCard
            key={script.id}
            isSpecial={script.category === 'Custom AI'}
            icon={<Headphones size={24} />}
            difficulty={script.difficultyLabel || script.difficulty}
            title={script.title}
            titleJa={script.titleJa}
            description={script.translation}
            actionText="シャドーイングを開始"
            actionIcon={<Play size={16} />}
            onClick={() => onSelectScript(script)}
          >
            {script.tipsJa && (
              <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#6366F1', background: '#F5F3FF', padding: '6px 10px', borderRadius: '8px', fontWeight: 600 }}>
                💡 {script.tipsJa}
              </div>
            )}
          </PracticeItemCard>
        ))}
      </div>
    </div>
  );
}
