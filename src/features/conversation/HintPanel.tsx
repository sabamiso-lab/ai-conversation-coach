import React from 'react';
import { Lightbulb } from 'lucide-react';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import DifficultyBadge from '../../components/common/DifficultyBadge';
import type { HintSuggestion } from '../../types';

export interface HintPanelProps {
  isOpen: boolean;
  onClose: () => void;
  hints: HintSuggestion[];
  loading?: boolean;
  onSelectHint: (englishText: string) => void;
}

export default function HintPanel({ 
  isOpen, 
  onClose, 
  hints, 
  loading = false, 
  onSelectHint 
}: HintPanelProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="次に言えるフレーズのヒント"
      icon={<Lightbulb className="text-amber-500" size={22} color="#F59E0B" />}
    >
      {loading ? (
        <LoadingState
          icon="sparkles"
          iconSize={32}
          message="AIが最適な回答フレーズを考えています..."
          padding="40px"
        />
      ) : (
        <div>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '16px' }}>
            どれか1つをタップすると、その内容で会話を続けることができます。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hints.map((hint, i) => (
              <div
                key={i}
                className="hint-bubble"
                onClick={() => {
                  onSelectHint(hint.english);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="hint-en">"{hint.english}"</span>
                  {hint.difficulty && <DifficultyBadge difficulty={hint.difficulty} />}
                </div>
                <div className="hint-ja" style={{ marginTop: '4px' }}>
                  {hint.japanese}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
