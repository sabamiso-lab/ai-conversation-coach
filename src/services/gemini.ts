import {
  truncateRepetitiveLoops,
  cleanPhrase,
  repairJson
} from '../utils/jsonRepair';

// Export utilities for backward compatibility & tests
export { truncateRepetitiveLoops, cleanPhrase, repairJson };

// Re-export AI services from modular files
export { sendChatMessage, getHintSuggestions, generateSessionReport } from './ai/chat';
export type {
  SendChatMessageOptions,
  SendChatMessageResult,
  GetHintSuggestionsOptions,
  HintSuggestionItem,
  GenerateSessionReportOptions,
  SessionReportResult
} from './ai/chat';

export { generateNewsSituation } from './ai/news';
export type { GenerateNewsOptions } from './ai/news';

export { generateShadowingScript, evaluateShadowingPerformance } from './ai/shadowing';
export type {
  GenerateShadowingScriptOptions,
  ShadowingScriptResult,
  EvaluateShadowingOptions,
  ShadowingEvaluationResult
} from './ai/shadowing';

export { generateBlitzQuestions, evaluateBlitzSpeech } from './ai/blitz';
export type {
  GenerateBlitzQuestionsOptions,
  GenerateBlitzQuestionsResult,
  EvaluateBlitzSpeechOptions,
  BlitzSpeechEvaluationResult
} from './ai/blitz';

export { askConversationCoach } from './ai/coach';
export type { AskConversationCoachParams, CoachResponse } from './ai/coach';
