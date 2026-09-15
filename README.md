# SpeakFlow 🎓 - AI Conversation Coach

Google の最新モデル **Gemini 3.5 Flash-Lite** を活用した、実践的で楽しい英会話トレーニングWebアプリケーションです。

---

## ✨ 主な機能

- 🎭 **リアルなロールプレイシチュエーション**
  - カフェでの注文、空港チェックイン、ホテル対応、ビジネス進捗会議、採用面接対策、自由フリートークなど多様なシーンを搭載。
- 🎙️ **音声認識 (Speech Recognition) ＆ 音声読み上げ (Speech Synthesis)**
  - マイクを使って英語で話しかけるとリアルタイムで文字起こしされ、AIの応答も自然な音声で再生されます。
- 💡 **「より自然なネイティブ表現 (Better Phrasing)」のリアルタイムアドバイス**
  - ユーザーの発言に対し、文法や自然さを分析して「ネイティブならこう言う」改善提案を表示。
- 💬 **日本語訳トグル機能**
  - ユーザー発言およびAIの応答の日本語訳をワンタップで切り替え表示。
- 🆘 **次に応答に困った時の「ヒント提案」機能**
  - 現在の会話文脈に合わせた3通りの回答フレーズ（Easy / Medium / Advanced）をAIが自動生成。
- 📊 **セッション終了後の総合診断レポート**
  - 会話終了時に Grammar, Vocabulary, Fluency を採点し、アドバイスや学んだキーフレーズリストを出力。

---

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + Vite
- **スタイル**: Vanilla CSS (Duolingoライクなクリーン学習UI)
- **AIエンジン**: Google Gemini API (`gemini-3.5-flash-lite`)
- **音声機能**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **アイコン**: Lucide-react

---

## 🚀 開発環境の起動方法

1. リポジトリをクローン:
   ```bash
   git clone https://github.com/sabamiso-lab/ai-conversation-coach.git
   cd ai-conversation-coach
   ```

2. 依存パッケージのインストール:
   ```bash
   npm install
   ```

3. 開発サーバーの起動:
   ```bash
   npm run dev
   ```

4. ブラウザで `http://localhost:5173/` にアクセスし、右上の「API Key 設定」からご自身の Gemini API Key を設定してください。

---

## 🔑 Gemini API Key の取得
[Google AI Studio](https://aistudio.google.com/app/apikey) より無料の API Key を取得してご利用いただけます。
