# 🎓 SpeakFlow - AI 英会話トレーニングアプリ

<p align="center">
  <img src="src/assets/react.svg" width="80" alt="SpeakFlow Logo" />
</p>

<p align="center">
  <b>Gemini 3.5 Flash-Lite</b> をはじめとする最新AIを搭載した、リアルタイム音声会話・実践的ロールプレイ・ネイティブ表現提案・詳細スコア診断を提供するインタラクティブな英会話学習Webアプリケーション。
</p>

<p align="center">
  <a href="https://sabamiso-lab.github.io/ai-conversation-coach/">
    <img src="https://img.shields.io/badge/Demo-Live%20App-brightgreen?style=for-the-badge&logo=githubpages" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue.svg?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/AI Engine-Gemini 3.5 Flash--Lite-8E44AD.svg?logo=google" alt="Gemini 3.5 Flash-Lite" />
  <img src="https://img.shields.io/badge/Speech API-Web Speech API-10B981.svg" alt="Web Speech API" />
  <img src="https://img.shields.io/badge/Deployment-GitHub Pages-222222.svg?logo=githubactions" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🌐 ライブデモ (Live Application)

SpeakFlow は GitHub Pages にて自動公開されています。以下のリンクからすぐにお試しいただけます：

👉 **[SpeakFlow Web App を試す](https://sabamiso-lab.github.io/ai-conversation-coach/)**

*(※ご利用にはご自身の Google Gemini API Key が必要です。API Key はブラウザの `LocalStorage` に安全にローカル保存されます。)*

---

## 🌟 主な機能 (Key Features)

### 🎭 1. シチュエーション別ロールプレイ
- **多様な実用シーン**: カフェでの注文、空港チェックイン、ホテル予約、ビジネス進捗ミーティング、英語ジョブインタビュー、自由フリートークなど。
- **難易度フィルター**: `Beginner` / `Intermediate` / `Advanced` / `Casual` の4段階で自分に合ったレベルを選択可能。
- **ミッション目標 (Goals)**: 各シナリオに明確な会話達成目標が設定されています。

### 🎙️ 2. 音声認識 ＆ 自動テキスト読み上げ (Speech-to-Text & TTS)
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
- **目標達成チェック**: 設定されたシナリオ目標を達成できたかを自動判定。

### ⚡ 7. Gemini モデル選択 ＆ ローカル保存
- `gemini-3.5-flash-lite`（デフォルト・超高速・軽量モデル）のほか、`gemini-2.0-flash` / `gemini-1.5-flash` / `gemini-1.5-pro` に対応。
- API Key と使用モデル設定はブラウザの `LocalStorage` に安全に保管されます。

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
ブラウザで [http://localhost:5173/ai-conversation-coach/](http://localhost:5173/ai-conversation-coach/) を開きます。

---

## 🔑 Gemini API Key の設定方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセスし、無料の API Key を作成します。
2. アプリ画面右上の **「API Key を設定」** ボタンをクリックします。
3. 取得した API Key を入力し、使用したいモデル（推奨: `gemini-3.5-flash-lite`）を選択して保存します。
4. ※ APIキーはブラウザの `LocalStorage` にローカル保存され、外部サーバーに送信されることは一切ありません。

---

## 🤖 利用可能な Gemini モデル

 SpeakFlow は以下の Google Gemini モデルに対応しています：

| モデル名 | 特徴 | 用途 |
|:---|:---|:---|
| **`gemini-3.5-flash-lite`** *(デフォルト)* | 超高速応答・会話に最適 | リアルタイムロールプレイ |
| **`gemini-2.0-flash`** | 高精度かつスピーディ | 高度なレッスン |
| **`gemini-1.5-flash`** | バランスの取れた標準モデル | 汎用会話 |
| **`gemini-1.5-pro`** | 高度な論理的分析 | 深い文法診断 |

---

## 🚀 デプロイ / CI/CD Workflow

GitHub Actions を利用した GitHub Pages への自動デプロイが構築されています。

- `.github/workflows/deploy.yml` により、`main` ブランチに `push` されると自動で `npm run build` が実行され、`GitHub Pages` へデプロイされます。

---

## 📁 ディレクトリ構成 (Project Structure)

```
ai-conversation-coach/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages 自動デプロイワークフロー
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                   # アプリメインエントリー＆状態管理
    ├── App.css
    ├── index.css                 # Clean & Friendly デザインシステム (CSS Vanilla)
    ├── components/
    │   ├── Header.jsx            # ヘッダー・APIキー/モデル設定ボタン
    │   ├── ApiKeyModal.jsx       # Gemini API Key ＆ モデル選択モーダル
    │   ├── SituationSelector.jsx # シチュエーション選択・難易度フィルター
    │   ├── ChatRoom.jsx          # 音声対話メイン画面
    │   ├── MessageItem.jsx       # 吹き出し（改善表現・翻訳・TTS再生）
    │   ├── HintPanel.jsx         # AI回答ヒントモーダル
    │   └── ReportModal.jsx       # 総合診断レポート画面
    ├── services/
    │   ├── gemini.js             # Gemini API 呼び出し (Structured JSON / Chat / Report)
    │   └── speech.js             # Web Speech API (音声認識・音声合成)
    └── data/
        └── situations.js         # シチュエーションデータ＆難易度定義
```

---

## 🛠️ 技術スタック (Tech Stack)

- **Frontend Core**: React 19, Vite 8
- **AI / LLM Engine**: Google Gemini API (`gemini-3.5-flash-lite` デフォルト)
- **Speech Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Oxlint](https://github.com/oxc-project/oxc)
- **CI/CD & Hosting**: GitHub Actions, GitHub Pages
- **Design System**: Vanilla CSS (Custom Tokens, Glassmorphism, Responsive UI)

---

## 📜 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。自由にご利用・カスタマイズいただけます。
