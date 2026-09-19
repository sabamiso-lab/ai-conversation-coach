export interface NewsSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface Situation {
  id: string;
  title: string;
  titleJa: string;
  category: string;
  icon?: string;
  difficulty?: string;
  systemRole: string;
  userRole?: string;
  description?: string;
  descriptionJa: string;
  initialMessage: string;
  initialMessageJa?: string;
  initialMessageTranslation?: string;
  goals: string[];
  newsSource?: NewsSource;
  isNews?: boolean;
  expiresAt?: number;
  newsCategory?: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  translation?: string;
  userTextTranslation?: string;
  clarityStatus?: 'FULL' | 'PARTIAL' | 'UNCLEAR' | 'natural' | 'acceptable' | 'needs_improvement';
  clarityBadgeJa?: string;
  clarityFeedbackJa?: string;
  simpleAlternative?: string | null;
  betterPhrasing?: string | null;
  phrasingTip?: string | null;
}

export interface HintSuggestion {
  english: string;
  japanese: string;
  nuance?: string;
}

export interface CoachPhrase {
  english: string;
  japanese: string;
}

export type CoachMode = 'conversation' | 'shadowing' | 'blitz' | 'general';

export interface CoachShadowingContext {
  title: string;
  category?: string;
  fullText?: string;
  sentences?: Array<{ id?: number; text: string; translationJa?: string }>;
  targetText?: string;
  userSpeech?: string;
  hasRecorded?: boolean;
  isRecording?: boolean;
  evalResult?: {
    overallScore?: number;
    accuracyScore?: number;
    pronunciationScore?: number;
    feedbackJa?: string;
    recognizedText?: string;
  } | null;
}

export interface CoachBlitzContext {
  topicTitle: string;
  currentIndex?: number;
  totalQuestions?: number;
  currentQuestion?: {
    id?: string;
    japanese?: string;
    prompt?: string;
    sampleAnswer?: string;
    answer?: string;
    keyPoints?: string[];
  };
  userSpeech?: string;
  hasAnswered?: boolean;
  isRevealed?: boolean;
  isCorrect?: boolean | null;
  aiEvaluation?: {
    isCorrect?: boolean;
    feedbackJa?: string;
    improvedAnswer?: string;
  } | null;
  allQuestions?: Array<{
    id?: string;
    japanese?: string;
    prompt?: string;
    sampleAnswer?: string;
    answer?: string;
    keyPoints?: string[];
  }>;
}

export interface CoachConversationContext {
  currentUserInput?: string;
  isWaitingForUserReply?: boolean;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedPhrases?: CoachPhrase[];
  timestamp: number;
}

export interface BetterExpression {
  original: string;
  better: string;
  reasonJa: string;
}

export interface SessionReport {
  overallScore: number;
  grammarScore?: number;
  vocabScore?: number;
  fluencyScore?: number;
  summaryJa: string;
  strengthsJa?: string[];
  improvementsJa?: string[];
  keyPhrases?: Array<{ phrase: string; meaning: string }>;
  goalsAchieved?: Array<{ goal: string; achieved: boolean }>;
  clearPoints?: string[];
  improvementPoints?: string[];
  betterExpressions?: BetterExpression[];
}

export interface ShadowingSentence {
  id: number;
  text: string;
  translationJa: string;
}

export interface ShadowingScript {
  id: string;
  title: string;
  category: string;
  fullText: string;
  sentences: ShadowingSentence[];
  audioUrl?: string;
}

export interface ShadowingEvaluation {
  accuracyScore: number;
  pronunciationScore: number;
  feedbackJa: string;
  recognizedText?: string;
}

export interface BlitzQuestion {
  id: string;
  prompt: string;
  answer: string;
  acceptedAnswers?: string[];
  explanation?: string;
  grammarPoint?: string;
  japanese?: string;
  sampleAnswer?: string;
  keyPoints?: string[];
}

export interface BlitzTopic {
  id: string;
  title: string;
  titleJa: string;
  category?: string;
  difficulty?: string;
  icon?: string;
  description?: string;
  descriptionJa?: string;
  questions: BlitzQuestion[];
}

export interface BlitzResult {
  questionId: string;
  question: BlitzQuestion;
  isCorrect: boolean;
  userSpeech: string;
  matchScore: number;
  responseTimeSec: number;
  aiEvaluation?: {
    isCorrect: boolean;
    score?: number;
    status?: 'PERFECT' | 'ACCEPTABLE' | 'NEEDS_WORK';
    statusLabelJa?: string;
    evaluationJa?: string;
    improvedSpeech?: string;
    feedbackJa?: string;
    improvedAnswer?: string;
    grammarAdviceJa?: string;
  } | null;
}

export interface GeminiApiOptions {
  apiKey: string;
  model: string;
  situation?: Situation;
  history?: ChatMessage[];
  userText?: string;
}
