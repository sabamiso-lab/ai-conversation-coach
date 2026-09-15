import React, { useState } from 'react';
import { Key, X, Check, ExternalLink } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey, currentModel, onSaveModel }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [modelInput, setModelInput] = useState(currentModel || 'gemini-3.5-flash-lite');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(keyInput.trim());
    onSaveModel(modelInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key className="text-primary" size={20} />
            <h2 className="modal-title">Gemini API Key 設定</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">API Key</label>
            <input
              type="password"
              className="input-field"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
              APIキーはブラウザの LocalStorage に保存され、外部に送信されることはありません。
            </span>
          </div>

          <div className="input-group">
            <label className="input-label">使用する Gemini モデル</label>
            <select 
              className="input-field"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
            >
              <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (デフォルト・超高速)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (最新・高速)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (標準)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (高精度)</option>
            </select>
          </div>

          <div style={{ marginTop: '12px', marginBottom: '20px' }}>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              style={{ fontSize: '0.85rem', color: '#4F46E5', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
            >
              Google AI Studio で無料の API Key を取得する <ExternalLink size={14} />
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {saved ? <><Check size={16} /> 保存完了</> : '保存して適用'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
