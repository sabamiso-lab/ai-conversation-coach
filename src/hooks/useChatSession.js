import { useState, useCallback } from 'react';
import { sendChatMessage, getHintSuggestions, generateSessionReport } from '../services/gemini';

export function useChatSession({ situation, apiKey, model }) {
  const [messages, setMessages] = useState(() => {
    if (situation?.initialMessage) {
      return [{
        id: 'msg-0',
        role: 'ai',
        text: situation.initialMessage,
        translation: situation.initialMessageJa || situation.initialMessageTranslation || ''
      }];
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hint State
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [hints, setHints] = useState([]);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Report State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const sendMessage = useCallback(async (textToSend, onSuccessAiText) => {
    const text = textToSend || inputText;
    if (!text.trim() || isAiThinking) return;

    if (!apiKey) {
      setErrorMsg("Gemini API Key が設定されていません。画面右上の [API Key 設定] から登録してください。");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim()
    };

    let updatedMessages = [];
    setMessages(prev => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });

    setInputText('');
    setIsAiThinking(true);
    setErrorMsg('');

    try {
      const aiResponse = await sendChatMessage({
        apiKey,
        model,
        situation,
        history: updatedMessages.slice(0, -1),
        userText: text.trim()
      });

      // Update user message with translation, clarity feedback, and phrasing suggestions
      setMessages(prev => prev.map(m => m.id === userMessage.id ? {
        ...m,
        userTextTranslation: aiResponse.userTextTranslation,
        clarityStatus: aiResponse.clarityStatus,
        clarityBadgeJa: aiResponse.clarityBadgeJa,
        clarityFeedbackJa: aiResponse.clarityFeedbackJa,
        simpleAlternative: aiResponse.simpleAlternative,
        betterPhrasing: aiResponse.betterPhrasing,
        phrasingTip: aiResponse.phrasingTip
      } : m));

      // Append AI response
      const newAiMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: aiResponse.aiResponseText,
        translation: aiResponse.aiResponseTranslation
      };

      setMessages(prev => [...prev, newAiMessage]);

      if (onSuccessAiText) {
        onSuccessAiText(aiResponse.aiResponseText);
      }

    } catch (err) {
      console.error("API error:", err);
      setErrorMsg(err.message || "Gemini API の呼び出し中にエラーが発生しました。");
    } finally {
      setIsAiThinking(false);
    }
  }, [inputText, isAiThinking, apiKey, model, situation]);

  const fetchHints = useCallback(async () => {
    setIsHintOpen(true);
    setIsHintLoading(true);
    try {
      const hintList = await getHintSuggestions({
        apiKey,
        model,
        situation,
        history: messages
      });
      setHints(hintList);
    } catch (err) {
      console.error("Hint error:", err);
      setErrorMsg("ヒントの生成に失敗しました。APIキーを確認してください。");
    } finally {
      setIsHintLoading(false);
    }
  }, [apiKey, model, situation, messages]);

  const finishSession = useCallback(async () => {
    setIsReportOpen(true);
    setIsReportLoading(true);
    setReportError('');
    try {
      const report = await generateSessionReport({
        apiKey,
        model,
        situation,
        history: messages
      });
      setReportData(report);
    } catch (err) {
      console.error("Report error:", err);
      const msg = err.message || "評価レポートの作成に失敗しました。";
      setReportError(msg);
      setErrorMsg(msg);
    } finally {
      setIsReportLoading(false);
    }
  }, [apiKey, model, situation, messages]);

  return {
    messages,
    inputText,
    setInputText,
    isAiThinking,
    errorMsg,
    setErrorMsg,
    sendMessage,
    // Hints
    isHintOpen,
    setIsHintOpen,
    hints,
    isHintLoading,
    fetchHints,
    // Report
    isReportOpen,
    setIsReportOpen,
    reportData,
    isReportLoading,
    reportError,
    finishSession
  };
}
