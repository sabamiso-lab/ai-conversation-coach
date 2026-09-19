import React from 'react';
import NewsCitation from '../../components/common/NewsCitation';
import type { Situation } from '../../types';

export interface ChatSidebarProps {
  situation?: Partial<Situation> | null;
  className?: string;
}

/**
 * 会話画面の右サイドバー（シナリオ情報、達成目標、学習アドバイス、ニュース出典）
 */
export default function ChatSidebar({ situation, className = 'sidebar-panel' }: ChatSidebarProps) {
  if (!situation) return null;

  return (
    <div className={className}>
      <NewsCitation newsSource={situation.newsSource} variant="card" />

      <div className="info-card">
        <div className="info-title">
          会話シナリオ目標
        </div>
        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
          {situation.descriptionJa}
        </div>

        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
          MISSION GOALS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {situation.goals?.map((g, i) => (
            <div key={i} style={{ fontSize: '0.82rem', color: '#1E293B', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <span style={{ color: '#4F46E5', fontWeight: 800 }}>✓</span> {g}
            </div>
          ))}
        </div>
      </div>

      <div className="info-card" style={{ background: '#EEF2FF', borderColor: '#C7D2FE' }}>
        <div className="info-title" style={{ color: '#3730A3' }}>
          💡 学習アドバイス
        </div>
        <p style={{ fontSize: '0.82rem', color: '#4338CA', lineHeight: 1.5 }}>
          完璧な英文を話そうと焦る必要はありません！間違えてもAIがネイティブらしい自然な言い回しをその場でアドバイスしてくれます。
        </p>
      </div>
    </div>
  );
}
