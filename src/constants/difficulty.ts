export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface DifficultyOption {
  id: DifficultyLevel;
  label: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { id: 'Beginner', label: '🌱 初級 (Beginner)' },
  { id: 'Intermediate', label: '⚡ 中級 (Intermediate)' },
  { id: 'Advanced', label: '🔥 上級 (Advanced)' }
];

export const DEFAULT_DIFFICULTY: DifficultyLevel = 'Intermediate';
