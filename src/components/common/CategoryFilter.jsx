import React from 'react';

/**
 * カテゴリ切り替えピル型フィルターコンポーネント
 * 
 * @param {Object} props
 * @param {string[]} props.categories - カテゴリ一覧
 * @param {string} props.selectedCategory - 現在選択されているカテゴリ
 * @param {(category: string) => void} props.onSelectCategory - カテゴリ選択時のコールバック
 * @param {(category: string) => React.ReactNode} [props.getLabel] - カテゴリの表示名カスタム関数
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - コンテナの追加スタイル
 */
export default function CategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
  getLabel,
  className = '',
  style = {}
}) {
  const defaultGetLabel = (cat) => (cat === 'All' ? 'すべて' : cat);
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
