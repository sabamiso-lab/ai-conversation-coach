/**
 * Web Speech API wrapper for Speech Recognition & Text-to-Speech
 */

export const isSpeechRecognitionSupported = () => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export const isSpeechSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Speech Recognition Manager
 */
export class SpeechRecognizer {
  constructor({ onResult, onError, onEnd, lang = 'en-US' }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.supported = false;
      return;
    }

    this.supported = true;
    this.isListening = false;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = lang;

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      let userFriendlyError = '音声認識エラーが発生しました。';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        userFriendlyError = 'マイクの使用が拒否されています。ブラウザのアドレスバーにある鍵マーク（またはマイクアイコン）からマイクの使用を許可してください。';
      } else if (event.error === 'no-speech') {
        userFriendlyError = '音声が検出されませんでした。マイクに向かってハッキリと話すか、もう一度ボタンを押してください。';
      } else if (event.error === 'audio-capture') {
        userFriendlyError = 'マイクが検出されませんでした。マイクが接続されているか確認してください。';
      } else if (event.error === 'network') {
        userFriendlyError = '音声認識ネットワーク接続エラーが発生しました。';
      }

      if (onError) onError(userFriendlyError, event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };
  }

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.isListening = true;
        this.recognition.start();
      } catch (err) {
        this.isListening = false;
        console.warn("Speech recognition start failed:", err);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Speech recognition stop error:", err);
      } finally {
        this.isListening = false;
      }
    }
  }
}

/**
 * Text-to-Speech Helper
 */
function setVoiceAndSpeak(utterance, onEnd) {
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function speakText(text, { lang = 'en-US', rate = 0.95, pitch = 1.0, onEnd } = {}) {
  if (!isSpeechSynthesisSupported()) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setVoiceAndSpeak(utterance, onEnd);
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      setVoiceAndSpeak(utterance, onEnd);
    };
    // Fallback if event doesn't fire
    setTimeout(() => {
      setVoiceAndSpeak(utterance, onEnd);
    }, 100);
  }
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
