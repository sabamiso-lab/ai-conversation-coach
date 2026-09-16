import React, { useState, useEffect } from 'react';
import { DIFFICULTY_COLORS } from '../data/situations';
import { fetchSituations } from '../services/api';
import { Coffee, Plane, Building, Briefcase, Award, MessageSquare, ArrowRight, Target, Loader2, Database } from 'lucide-react';

const ICON_MAP = {
  Coffee,
  Plane,
  Building,
  Briefcase,
  Award,
  MessageSquare
};

export default function SituationSelector({ onSelectSituation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [situations, setSituations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function loadSituations() {
      setIsLoading(true);
      const { data, isFallback: fallbackFlag } = await fetchSituations();
      if (isMounted) {
        setSituations(data);
        setIsFallback(fallbackFlag);
        setIsLoading(false);
      }
    }

    loadSituations();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['All', 'Daily', 'Travel', 'Business', 'Casual'];

  const filteredSituations = selectedCategory === 'All' 
    ? situations 
    : situations.filter(s => s.category === selectedCategory);

  return (
    <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          英会話の訓練シチュエーションを選択
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          AIが指定した役柄になりきって対話します。あなたの英語力に合わせて会話を進めましょう。
          {!isLoading && !isFallback && (
            <span style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Database size={12} /> DynamoDB 連動
            </span>
          )}
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
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

      {/* Loading State */}
      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 12px auto', color: '#4F46E5' }} />
          <p style={{ fontWeight: 600 }}>シチュエーションを読み込み中...</p>
        </div>
      ) : (
        /* Grid */
        <div className="situation-grid">
          {filteredSituations.map(sit => {
            const IconComponent = ICON_MAP[sit.icon] || MessageSquare;
            const badgeClass = DIFFICULTY_COLORS[sit.difficulty] || 'badge-blue';

            return (
              <div 
                key={sit.id} 
                className="situation-card"
                onClick={() => onSelectSituation(sit)}
              >
                <div>
                  <div className="card-top">
                    <div className="icon-box">
                      <IconComponent size={26} />
                    </div>
                    <span className={`badge ${badgeClass}`}>
                      {sit.difficulty}
                    </span>
                  </div>

                  <div className="card-title">{sit.title}</div>
                  <div className="card-title-ja">{sit.titleJa}</div>

                  <p className="card-desc">
                    {sit.descriptionJa}
                  </p>

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
