import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MicButton from '../MicButton';

describe('MicButton component', () => {
  it('renders default state and calls onClick', () => {
    const handleClick = vi.fn();
    render(<MicButton isRecording={false} onClick={handleClick} />);

    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('mic-btn');
    expect(btn).not.toHaveClass('recording');
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders recording state with recording class and pressed aria attribute', () => {
    render(<MicButton isRecording={true} onClick={vi.fn()} />);

    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('recording');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });
});
