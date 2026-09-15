# 🎓 SpeakFlow - AI 英会話トレーニングアプリ

<p align="center">
  <img src="src/assets/react.svg" width="80" alt="SpeakFlow Logo" />
</p>

<p align="center">
  <b>Gemini 3.5 Flash-Lite</b> を搭載した、リアルタイム音声会話・実践的ロールプレイ・ネイティブ表現提案・詳細スコア診断を提供するインタラクティブな英会話学習Webアプリケーション。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue.svg?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/AI Engine-Gemini 3.5 Flash--Lite-8E44AD.svg?logo=google" alt="Gemini 3.5 Flash-Lite" />
  <img src="https://img.shields.io/badge/Speech API-Web Speech API-10B981.svg" alt="Web Speech API" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🌟 主な機能 (Key Features)

### 🎭 1. シチュエーション別ロールプレイ
- **多様な実用シーン**: カフェでの注文、空港チェックイン、ホテル予約、ビジネス進捗ミーティング、英語ジョブインタビュー、自由フリートークなど。
- **難易度フィルター**: `Beginner` / `Intermediate` / `Advanced` / `Casual` の4段階で自分に合ったレベルを選択可能。
- **ミッション目標 (Goals)**: 各シナリオに明確な会話達成目標が設定されています。

### 🎙️ 2. 音声認識 ＆ 自動テキスト読み上げ
- **Web Speech API 連携**: マイクボタンを押して話しかけるだけで、リアルタイムで正確に音声認識＆文字起こし。
- **自然な発話再生**: AIの応答メッセージをクリアな英語音声（Text-to-Speech）で自動再生。

### ✨ 3. 「より自然なネイティブ表現 (Better Phrasing)」のリアルタイムアドバイス
- ユーザーの発言に対し、文法エラーや不自然な箇所をAIが即座に分析。
- 「こう言ったほうがよりネイティブらしく聞こえるよ！」という自然な表現提案と簡単なワンポイント解説をリアルタイム表示。

### 💬 4. 日本語訳トグル ＆ 音声聞き直し
- ユーザー発話とAI応答の両方に、ワンタップで切り替え可能な「日本語訳」を自動付与。
- いつでも発話内容を何度でも音声再生してリスニング学習が可能。

### 💡 5. 次に応答に困った時の「AIヒント提案」
- 会話中「次になんと言えばいいか分からない」ときにヒントボタンをタップ。
- AIが現在の会話文脈に合わせた3つの回答フレーズ（`Easy` / `Medium` / `Advanced`）を自動生成。

### 📊 6. 会話セッション総合診断レポート
- 会話を「終了して診断」すると、AIがセッション全体を総合分析。
- **スコア表示 (100点満点)**: 総合スコア + `Grammar (文法)` / `Vocabulary (語彙)` / `Fluency (会話の流れ)`
- **詳細フィードバック**: 良かった点・次回への改善ポイント
- **今回学んだキーフレーズ集**: 実用的なフレーズと日本語訳の復習カードを出力。

---

## 📸 画面イメージ (Application Preview)

| 1. シチュエーション選択画面 | 2. リアルタイム音声対話画面 |
|:---:|:---:|
| ロールプレイと難易度を選択 | 音声入力・日本語訳・ネイティブ改善提案 |

| 3. AIヒント提案 | 4. セッション診断レポート |
|:---:|:---:|
| 3段階のフレーズ提案 | 総合スコア・アドバイス・キーフレーズ復習 |

---

## 🚀 クイックスタート (Getting Started)

### 1. リポジトリのクローン
```bash
git clone https://github.com/sabamiso-lab/ai-conversation-coach.git
cd ai-conversation-coach
```

### 2. 依存パッケージのインストール
```bash
npm install
```

### 3. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで [http://localhost:5173/](http://localhost:5173/) を開きます。

---

## 🔑 Gemini API Key の設定方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセスし、無料の API Key を作成します。
2. アプリ画面右上の **「API Key を設定」** ボタンをクリックします。
3. 取得した API Key を入力して保存します。（※ APIキーはブラウザの `LocalStorage` に安全にローカル保存され、外部に送信されることはありません。）
4. 使用モデルとして **`gemini-3.5-flash-lite`** がデフォルト選択されています。

---

## 📁 ディレクトリ構成 (Project Structure)

```
ai-conversation-coach/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                   # アプリメインエントリー＆状態管理
    ├── index.css                 # Clean & Friendly デザインシステム
    ├── components/
    │   ├── Header.jsx            # ヘッダー・APIキー設定ボタン
    │   ├── ApiKeyModal.jsx       # Gemini API Key設定モーダル
    │   ├── SituationSelector.jsx # シチュエーション選択画面
    │   ├── ChatRoom.jsx          # 音声対話メイン画面
    │   ├── MessageItem.jsx       # 吹き出し（改善表現・翻訳付き）
    │   ├── HintPanel.jsx         # AI回答ヒントモーダル
    │   └── ReportModal.jsx       # 診断レポート画面
    ├── services/
    │   ├── gemini.js             # Gemini 3.5 Flash-Lite API 呼び出し
    │   └── speech.js             # Web Speech API (音声認識・音声合成)
    └── data/
        └── situations.js         # シチュエーション＆マスターデータ
```

---

## 🛠️ 技術スタック (Tech Stack)

- **Frontend Core**: React 19, Vite
- **AI / LLM Engine**: Google Gemini API (`gemini-3.5-flash-lite`)
- **Speech Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Design System**: Vanilla CSS (Custom Tokens, Glassmorphism, Micro-animations)

---

## 📜 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。自由にご利用・カスタマイズいただけます。
