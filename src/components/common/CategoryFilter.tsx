import React from 'react';

export interface CategoryFilterProps {
  categories: readonly string[] | string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  getLabel?: (category: string) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function CategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
  getLabel,
  className = '',
  style = {}
}: CategoryFilterProps) {
  const defaultGetLabel = (cat: string) => (cat === 'All' ? 'すべて' : cat);
  const resolveLabel = getLabel || defaultGetLabel;

  return (
    <div
      className={`category-filter-bar ${className}`.trim()}
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        ...style
      }}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSelectCategory(cat)}
            style={{
              borderRadius: '9999px',
              padding: '8px 20px',
              fontSize: '0.88rem'
            }}
          >
            {resolveLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}
