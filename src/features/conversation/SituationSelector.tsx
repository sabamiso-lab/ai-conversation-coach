import React, { useState, useEffect } from 'react';
import { 
  Coffee, Plane, Building, Briefcase, Award, MessageSquare, 
  Target, Globe, Zap, Newspaper, LucideIcon 
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CategoryFilter from '../../components/common/CategoryFilter';
import LoadingState from '../../components/common/LoadingState';
import NewsCitation from '../../components/common/NewsCitation';
import PracticeItemCard from '../../components/common/PracticeItemCard';
import { NewsGeneratorSection } from './NewsGeneratorSection';
import { fetchSituations } from '../../services/api';
import { useSettings } from '../../hooks/useSettings';
import { Situation } from '../../types';

const ICON_MAP: Record<string, LucideIcon> = {
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

export interface SituationSelectorProps {
  onSelectSituation: (situation: Situation) => void;
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
}

export default function SituationSelector({ 
  onSelectSituation, 
  apiKey: propsApiKey, 
  model: propsModel, 
  onOpenApiKeyModal: propsOnOpenApiKeyModal 
}: SituationSelectorProps) {
  const settings = useSettings();
  const apiKey = propsApiKey !== undefined ? propsApiKey : (settings.apiKey || '');
  const model = propsModel !== undefined ? propsModel : (settings.model || 'gemini-3.5-flash-lite');
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [situations, setSituations] = useState<Situation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleNewsGenerated = (newSituation: Situation) => {
    setSituations((prev) => [newSituation, ...prev]);
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

      {/* Dynamic News Grounding Generator Section */}
      <NewsGeneratorSection
        apiKey={apiKey}
        model={model}
        onOpenApiKeyModal={onOpenApiKeyModal}
        onNewsGenerated={handleNewsGenerated}
      />

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
            const IconComponent = (sit.icon && ICON_MAP[sit.icon]) || MessageSquare;

            return (
              <PracticeItemCard
                key={sit.id}
                isSpecial={sit.isNews}
                icon={<IconComponent size={24} />}
                iconBg={sit.isNews ? '#EEF2FF' : '#F1F5F9'}
                iconColor={sit.isNews ? '#4F46E5' : '#475569'}
                badges={
                  sit.isNews ? (
                    <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }}>
                      📰 News
                    </span>
                  ) : undefined
                }
                difficulty={sit.difficulty || 'beginner'}
                title={sit.title}
                titleJa={sit.titleJa}
                description={sit.descriptionJa}
                actionText="会話を開始する"
                onClick={() => onSelectSituation(sit)}
              >
                {/* News Citation Link if available */}
                <NewsCitation newsSource={sit.newsSource} variant="badge" />

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
              </PracticeItemCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
