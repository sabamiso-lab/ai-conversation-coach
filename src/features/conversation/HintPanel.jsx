import React from 'react';
import { Lightbulb, X, Sparkles } from 'lucide-react';

export default function HintPanel({ isOpen, onClose, hints, loading, onSelectHint }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb className="text-amber-500" size={22} color="#F59E0B" />
            <h2 className="modal-title">次に言えるフレーズのヒント</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            <Sparkles className="animate-spin" size={32} color="#4F46E5" style={{ margin: '0 auto 12px auto' }} />
            AIが最適な回答フレーズを考えています...
          </div>
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
                    <span className="badge badge-blue">{hint.difficulty}</span>
                  </div>
                  <div className="hint-ja" style={{ marginTop: '4px' }}>
                    {hint.japanese}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
