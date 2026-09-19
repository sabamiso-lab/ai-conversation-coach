import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ApiKeyModal from '../ApiKeyModal';

describe('ApiKeyModal component', () => {
  it('does not render when isOpen is false', () => {
    render(<ApiKeyModal isOpen={false} />);
    expect(screen.queryByText('Gemini API Key 設定')).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen is true', () => {
    render(
      <ApiKeyModal
        isOpen={true}
        apiKey="test-key-123"
        currentModel="gemini-3.5-flash-lite"
        onClose={vi.fn()}
        onSaveKey={vi.fn()}
        onSaveModel={vi.fn()}
      />
    );

    expect(screen.getByText('Gemini API Key 設定')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AIzaSy...')).toHaveValue('test-key-123');
    expect(screen.getByRole('combobox')).toHaveValue('gemini-3.5-flash-lite');
  });

  it('calls onSaveKey and onSaveModel on form submit', () => {
    const handleSaveKey = vi.fn();
    const handleSaveModel = vi.fn();
    const handleClose = vi.fn();

    render(
      <ApiKeyModal
        isOpen={true}
        apiKey=""
        currentModel="gemini-3.5-flash-lite"
        onClose={handleClose}
        onSaveKey={handleSaveKey}
        onSaveModel={handleSaveModel}
      />
    );

    const inputKey = screen.getByPlaceholderText('AIzaSy...');
    fireEvent.change(inputKey, { target: { value: '  AIzaSyNewKey  ' } });

    const selectModel = screen.getByRole('combobox');
    fireEvent.change(selectModel, { target: { value: 'gemini-3.5-flash-lite' } });

    const submitBtn = screen.getByRole('button', { name: /保存して適用/i });
    fireEvent.click(submitBtn);

    expect(handleSaveKey).toHaveBeenCalledWith('AIzaSyNewKey');
    expect(handleSaveModel).toHaveBeenCalledWith('gemini-3.5-flash-lite');
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(<ApiKeyModal isOpen={true} onClose={handleClose} />);

    const cancelBtn = screen.getByRole('button', { name: /キャンセル/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
