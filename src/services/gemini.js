import {
  truncateRepetitiveLoops,
  cleanPhrase,
  repairJson
} from '../utils/jsonRepair';

// Export utilities for backward compatibility & tests
export { truncateRepetitiveLoops, cleanPhrase, repairJson };

// Re-export AI services from modular files
export { sendChatMessage, getHintSuggestions, generateSessionReport } from './ai/chat';
export { generateNewsSituation } from './ai/news';
export { generateShadowingScript, evaluateShadowingPerformance } from './ai/shadowing';
export { generateBlitzQuestions, evaluateBlitzSpeech } from './ai/blitz';
export { askConversationCoach } from './ai/coach';
