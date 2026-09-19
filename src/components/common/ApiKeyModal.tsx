import React, { useState } from 'react';
import { Key, Check, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import { useSettings } from '../../hooks/useSettings';

export interface ApiKeyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  apiKey?: string;
  onSaveKey?: (key: string) => void;
  currentModel?: string;
  onSaveModel?: (model: string) => void;
}

interface ApiKeyFormProps {
  initialKey: string;
  initialModel: string;
  onSave: (key: string, model: string) => void;
  onClose: () => void;
}

function ApiKeyForm({ initialKey, initialModel, onSave, onClose }: ApiKeyFormProps) {
  const [keyInput, setKeyInput] = useState(initialKey);
  const [modelInput, setModelInput] = useState(initialModel);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keyInput.trim(), modelInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
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
          <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (標準・超高速)</option>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          キャンセル
        </button>
        <button type="submit" className="btn btn-primary">
          {saved ? <><Check size={16} /> 保存完了</> : '保存して適用'}
        </button>
      </div>
    </form>
  );
}

export default function ApiKeyModal({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  apiKey: propsApiKey,
  onSaveKey: propsOnSaveKey,
  currentModel: propsCurrentModel,
  onSaveModel: propsOnSaveModel
}: ApiKeyModalProps = {}) {
  const settings = useSettings();

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : settings.isApiKeyModalOpen;
  const onClose = propsOnClose ?? settings.closeApiKeyModal;
  const activeApiKey = propsApiKey !== undefined ? propsApiKey : settings.apiKey;
  const activeModel = propsCurrentModel !== undefined ? propsCurrentModel : settings.model;
  const saveKey = propsOnSaveKey ?? settings.saveApiKey;
  const saveModel = propsOnSaveModel ?? settings.saveModel;

  if (!isOpen) return null;

  const handleSave = (key: string, model: string) => {
    saveKey(key);
    saveModel(model);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gemini API Key 設定"
      icon={<Key className="text-primary" size={20} />}
    >
      <ApiKeyForm
        key={activeApiKey || 'new'}
        initialKey={activeApiKey || ''}
        initialModel={activeModel || 'gemini-3.5-flash-lite'}
        onSave={handleSave}
        onClose={onClose}
      />
    </Modal>
  );
}
