import React, { useState, useEffect } from 'react';
import { 
  Coffee, Plane, Building, Briefcase, Award, MessageSquare, 
  ArrowRight, Target, Globe, Zap, Newspaper, LucideIcon 
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CategoryFilter from '../../components/common/CategoryFilter';
import LoadingState from '../../components/common/LoadingState';
import DifficultyBadge from '../../components/common/DifficultyBadge';
import NewsCitation from '../../components/common/NewsCitation';
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
                      <DifficultyBadge difficulty={sit.difficulty || 'beginner'} />
                    </div>
                  </div>

                  <div className="card-title">{sit.title}</div>
                  <div className="card-title-ja">{sit.titleJa}</div>

                  <p className="card-desc">
                    {sit.descriptionJa}
                  </p>

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
