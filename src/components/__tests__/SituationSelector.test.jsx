import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SituationSelector from '../SituationSelector';
import * as apiModule from '../../services/api';

vi.mock('../../services/api');

describe('SituationSelector component', () => {
  const mockSituations = [
    {
      id: 'sit-1',
      title: 'Coffee Shop Order',
      titleJa: 'カフェでの注文',
      category: 'Daily',
      icon: 'Coffee',
      difficulty: 'beginner',
      descriptionJa: 'カフェで注文を行う練習',
      goals: ['Order a latte', 'Ask for the price'],
    },
    {
      id: 'sit-2',
      title: 'Job Interview',
      titleJa: '面接のやり取り',
      category: 'Business',
      icon: 'Briefcase',
      difficulty: 'advanced',
      descriptionJa: '英語面接の練習',
      goals: ['Introduce yourself', 'Answer questions'],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    apiModule.fetchSituations.mockResolvedValue({
      data: mockSituations,
      isFallback: true,
    });
  });

  it('renders loading state initially and then displays situation list', async () => {
    render(<SituationSelector onSelectSituation={vi.fn()} />);

    // Initially should show loading message
    expect(screen.getByText(/シチュエーションを読み込み中.../i)).toBeInTheDocument();

    // After async load
    await waitFor(() => {
      expect(screen.getByText('Coffee Shop Order')).toBeInTheDocument();
      expect(screen.getByText('Job Interview')).toBeInTheDocument();
    });
  });

  it('filters situations when category buttons are clicked', async () => {
    render(<SituationSelector onSelectSituation={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Coffee Shop Order')).toBeInTheDocument();
    });

    // Click "Business" category button
    const businessButton = screen.getByRole('button', { name: 'Business' });
    fireEvent.click(businessButton);

    expect(screen.queryByText('Coffee Shop Order')).not.toBeInTheDocument();
    expect(screen.getByText('Job Interview')).toBeInTheDocument();
  });

  it('triggers onSelectSituation callback when a card is clicked', async () => {
    const handleSelect = vi.fn();
    render(<SituationSelector onSelectSituation={handleSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Coffee Shop Order')).toBeInTheDocument();
    });

    const card = screen.getByText('Coffee Shop Order').closest('.situation-card');
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledWith(mockSituations[0]);
  });

  it('triggers onOpenApiKeyModal if news generation is clicked without an API key', async () => {
    const handleOpenModal = vi.fn();
    render(<SituationSelector onSelectSituation={vi.fn()} apiKey="" onOpenApiKeyModal={handleOpenModal} />);

    // Open news generation form accordion first
    const openFormBtn = screen.getByRole('button', { name: /AIで作成する/i });
    fireEvent.click(openFormBtn);

    await waitFor(() => {
      expect(screen.getByText(/🚀 Tech & AI/i)).toBeInTheDocument();
    });

    const techButton = screen.getByRole('button', { name: /🚀 Tech & AI/i });
    fireEvent.click(techButton);

    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  it('renders difficulty selection buttons and allows selecting Beginner / Advanced', async () => {
    render(<SituationSelector onSelectSituation={vi.fn()} apiKey="test-key" />);

    // Open news generation form accordion first
    const openFormBtn = screen.getByRole('button', { name: /AIで作成する/i });
    fireEvent.click(openFormBtn);

    await waitFor(() => {
      expect(screen.getByText(/① 英語難易度を選択/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /🌱 初級/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⚡ 中級/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🔥 上級/i })).toBeInTheDocument();

    // Click Beginner difficulty button
    const beginnerBtn = screen.getByRole('button', { name: /🌱 初級/i });
    fireEvent.click(beginnerBtn);

    // Beginner button should now display its description
    expect(screen.getByText(/平易な語彙・短文で要約/i)).toBeInTheDocument();
  });
});
