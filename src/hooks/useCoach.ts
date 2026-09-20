import { useContext } from 'react';
import { CoachContext, CoachContextType } from '../contexts/CoachContext';

export const defaultCoachContextValue: CoachContextType = {
  mode: 'general',
  situation: null,
  conversationHistory: [],
  conversationContext: null,
  shadowingContext: null,
  blitzContext: null,
  isOpen: false,
  setIsOpen: () => {},
  toggleOpen: () => {},
  isLoading: false,
  error: null,
  questionInput: '',
  setQuestionInput: () => {},
  coachMessages: [],
  askQuestion: async () => {},
  clearHistory: () => {},
  updateCoachContext: () => {},
  resetCoachContext: () => {}
};

export function useCoach(): CoachContextType {
  const context = useContext(CoachContext);
  return context || defaultCoachContextValue;
}
