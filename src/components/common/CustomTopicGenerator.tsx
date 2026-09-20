import React, { useState } from 'react';
import { Loader2, Dices, Zap } from 'lucide-react';
import AiGeneratorCard from './AiGeneratorCard';
import SuggestionChips, { SuggestionChipItem } from './SuggestionChips';
import Alert from './Alert';
import { DIFFICULTY_OPTIONS, DEFAULT_DIFFICULTY } from '../../constants/difficulty';

export interface CustomTopicGeneratorProps {
  hasApiKey: boolean;
  onOpenApiKeyModal?: () => void;
  title: string;
  description: string;
  badgeText?: string;
  topicLabel?: string;
  topicPlaceholder?: string;
  suggestionChips?: readonly (SuggestionChipItem | string)[] | (SuggestionChipItem | string)[];
  getRandomTopic?: () => string;
  isGenerating?: boolean;
  errorMsg?: string;
  generatingLabel?: string;
  omakaseButtonLabel?: string;
  customButtonLabel?: string;
  onSubmit: (params: { topic: string; difficulty: string }) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function CustomTopicGenerator({
  hasApiKey,
  onOpenApiKeyModal,
  title,
  description,
  badgeText = 'Gemini AI カスタム作成',
  topicLabel = '生成したいトピック / シチュエーション',
  topicPlaceholder = '例: 海外旅行のトラブル、病院受診... (空欄でおまかせ)',
  suggestionChips = [],
  getRandomTopic,
  isGenerating = false,
  errorMsg,
  generatingLabel = 'AI作成中...',
  omakaseButtonLabel = '🎲 おまかせで生成',
  customButtonLabel = 'AIで生成して練習開始',
  onSubmit,
  isOpen: propsIsOpen,
  onToggle: propsOnToggle
}: CustomTopicGeneratorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState<string>(DEFAULT_DIFFICULTY);

  const normalizedChips: SuggestionChipItem[] = suggestionChips.map(chip => 
    typeof chip === 'string' ? { label: chip, topic: chip } : chip
  );

  const isFormOpen = propsIsOpen !== undefined ? propsIsOpen : internalIsOpen;
  const handleToggle = propsOnToggle || (() => setInternalIsOpen(prev => !prev));

  const handleRandomize = () => {
    if (getRandomTopic) {
      setTopicInput(getRandomTopic());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasApiKey) {
      if (onOpenApiKeyModal) {
        onOpenApiKeyModal();
      }
      return;
    }

    onSubmit({
      topic: topicInput.trim(),
      difficulty
    });
  };

  return (
    <AiGeneratorCard
      badgeText={badgeText}
      hasApiKey={hasApiKey}
      title={title}
      description={description}
      isOpen={isFormOpen}
      onToggle={handleToggle}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1' }}>
                {topicLabel}
              </label>
              {getRandomTopic && (
                <button
                  type="button"
                  onClick={handleRandomize}
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
              )}
            </div>
            <input
              type="text"
              className="input-field"
              placeholder={topicPlaceholder}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              disabled={isGenerating}
              style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', width: '100%' }}
            />

            {normalizedChips.length > 0 && (
              <SuggestionChips
                chips={normalizedChips}
                onSelect={setTopicInput}
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
              難易度
            </label>
            <select
              className="input-field"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={isGenerating}
              style={{ background: '#1E293B', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              {DIFFICULTY_OPTIONS.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <Alert variant="error" style={{ marginBottom: '16px' }}>
            {errorMsg}
          </Alert>
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
                <Loader2 size={16} className="animate-spin" /> {generatingLabel}
              </>
            ) : !topicInput.trim() ? (
              <>
                <Dices size={16} /> {omakaseButtonLabel}
              </>
            ) : (
              <>
                <Zap size={16} /> {customButtonLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </AiGeneratorCard>
  );
}
