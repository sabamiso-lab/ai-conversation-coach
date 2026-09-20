import React, { useState } from 'react';
import { PRESET_BLITZ_TOPICS, getRandomBlitzTopic, POPULAR_BLITZ_TOPIC_CHIPS } from './blitzTopics';
import { 
  Zap, Briefcase, Smile, Clock, 
  BookOpen, Sparkles, Layers, TrendingUp,
  Compass, HelpCircle, MessageSquare
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CategoryFilter from '../../components/common/CategoryFilter';
import CustomTopicGenerator from '../../components/common/CustomTopicGenerator';
import PracticeItemCard from '../../components/common/PracticeItemCard';
import { useSettings } from '../../hooks/useSettings';
import type { BlitzQuestion, BlitzTopic } from '../../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Smile,
  Zap,
  BookOpen,
  Sparkles,
  Clock,
  Layers,
  TrendingUp,
  Compass,
  HelpCircle,
  MessageSquare
};

const CATEGORIES = ['All', 'Grammar', 'Business', 'Daily'];

const TIMER_OPTIONS = [
  { sec: 3, label: '⚡ 3秒 (超高速)', desc: '上級者向け・瞬発力特訓' },
  { sec: 5, label: '⏱️ 5秒 (標準)', desc: 'テンポよく即答' },
  { sec: 7, label: '🌱 7秒 (じっくり)', desc: 'ゆっくり確実に発話' },
  { sec: 0, label: '♾️ 制限なし', desc: '自分のペースで' }
];

export interface BlitzGenerateParams {
  topicPrompt: string;
  difficulty: string;
  timerSeconds: number;
}

export interface BlitzTopicSelectorProps {
  onStartSession: (questions: BlitzQuestion[], topicTitle: string, timerSeconds: number) => void;
  onGenerateCustom: (params: BlitzGenerateParams) => void;
  isGenerating?: boolean;
  hasApiKey?: boolean;
  onOpenApiKeyModal?: () => void;
}

export default function BlitzTopicSelector({
  onStartSession,
  onGenerateCustom,
  isGenerating = false,
  hasApiKey: propsHasApiKey,
  onOpenApiKeyModal: propsOnOpenApiKeyModal
}: BlitzTopicSelectorProps) {
  const settings = useSettings();
  const hasApiKey = propsHasApiKey !== undefined ? propsHasApiKey : Boolean(settings.apiKey);
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;

  const [topics] = useState<BlitzTopic[]>(PRESET_BLITZ_TOPICS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timerSeconds, setTimerSeconds] = useState(5);

  const handleCustomSubmit = ({ topic, difficulty }: { topic: string; difficulty: string }) => {
    onGenerateCustom({
      topicPrompt: topic || 'おまかせ',
      difficulty,
      timerSeconds
    });
  };

  const filteredTopics = selectedCategory === 'All'
    ? topics
    : topics.filter(t => t.category === selectedCategory);

  return (
    <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Title Banner */}
      <PageHeader
        badgeIcon={<Zap size={16} />}
        badgeText="Oral Blitz Studio"
        title="瞬間英作文・パターンプラクティス"
        description="日本語のメッセージを見て、1〜5秒以内に即座に英語で発話！文法を考える隙を与えず、使える構文と表現パターンを脳に爆速で叩き込みます。"
      />

      {/* AI Custom Script Generator Card */}
      <CustomTopicGenerator
        hasApiKey={hasApiKey}
        onOpenApiKeyModal={onOpenApiKeyModal}
        title="自由なお題でオリジナル瞬間英作文10問セットを生成"
        description="「ITエンジニアのスクラム」「海外ホテルのトラブル」など自由入力または🎲ランダム設定で作成できます。"
        topicPlaceholder="例: ITスクラム、海外旅行のトラブル... (空欄でおまかせ)"
        suggestionChips={POPULAR_BLITZ_TOPIC_CHIPS}
        getRandomTopic={getRandomBlitzTopic}
        isGenerating={isGenerating}
        generatingLabel="10問セット作成中..."
        omakaseButtonLabel="🎲 おまかせで10問セット生成"
        customButtonLabel="AI英作文セットを生成"
        onSubmit={handleCustomSubmit}
      />

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
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Topics Grid */}
      <div className="situation-grid">
        {filteredTopics.map(topic => {
          const IconComponent = (topic.icon && ICON_MAP[topic.icon]) || Zap;

          return (
            <PracticeItemCard
              key={topic.id}
              isSpecial={topic.category === 'Custom AI'}
              icon={<IconComponent size={24} />}
              badges={
                <span className="badge" style={{ background: '#F1F5F9', color: '#475569', fontWeight: 700 }}>
                  {topic.questions ? `${topic.questions.length}問` : '10問'}
                </span>
              }
              difficulty={topic.difficulty}
              title={topic.title}
              titleJa={topic.titleJa || topic.category}
              description={topic.description}
              actionButton={
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
              }
              onClick={() => onStartSession(topic.questions, topic.title, timerSeconds)}
            />
          );
        })}
      </div>
    </div>
  );
}
