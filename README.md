# 🎓 SpeakFlow - AI 英会話 ＆ シャドーイング ＆ 瞬間英作文 トレーニング

<p align="center">
  <img src="public/favicon.svg" width="80" alt="SpeakFlow Logo" />
</p>

<p align="center">
  <b>Google Gemini API</b>（<code>gemini-3.5-flash-lite</code>）を搭載した、リアルタイム音声会話・実践的ロールプレイ・ニュース動的シナリオ生成・<b>シャドーイング音読特訓</b>・<b>瞬間英作文＆パターンプラクティス (Instant Oral Blitz)</b>・<b>全画面常駐 AI コーチ</b>・詳細スコア診断を提供する総合英会話学習 Web アプリケーション。
</p>

<p align="center">
  <a href="https://sabamiso-lab.github.io/ai-conversation-coach/">
    <img src="https://img.shields.io/badge/Demo-Live%20App-brightgreen?style=for-the-badge&logo=githubpages" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue.svg?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245.svg?logo=reactrouter" alt="React Router 7" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/AI%20Engine-Gemini%203.5%20Flash--Lite-8E44AD.svg?logo=google" alt="Gemini 3.5 Flash-Lite" />
  <img src="https://img.shields.io/badge/Backend-AWS%20CDK%20%2F%20DynamoDB-FF9900.svg?logo=amazonaws" alt="AWS CDK & DynamoDB" />
  <img src="https://img.shields.io/badge/Mobile-Responsive-green.svg" alt="Mobile Responsive" />
  <img src="https://img.shields.io/badge/Testing-144%20Tests%20Passing-6E9F18.svg?logo=vitest" alt="Vitest 144 Tests" />
  <img src="https://img.shields.io/badge/Deployment-GitHub%20Pages-222222.svg?logo=githubactions" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🌐 ライブデモ (Live Application)

SpeakFlow は GitHub Pages にて公開されています。ブラウザからすぐにお試しいただけます：

👉 **[SpeakFlow Web App を試す](https://sabamiso-lab.github.io/ai-conversation-coach/)**

*(※ ご利用にはご自身の Google Gemini API Key が必要です。API Key はブラウザの `LocalStorage` に安全にローカル保存されます。)*

---

## 📚 ドキュメント (Documentation)

プロジェクトの目的に応じて、以下のドキュメントをご参照ください：

| ドキュメント | 概要 |
| :--- | :--- |
| 📖 **[機能仕様・学習機能ガイド (docs/FEATURES.md)](docs/FEATURES.md)** | **【機能的な話】** ロールプレイ、瞬間英作文、シャドーイング、常駐AIコーチの詳細仕様と学習フロー。 |
| 🏗️ **[技術アーキテクチャ・仕様 (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)** | **【技術的な話】** システム構成図、フロントエンド設計、AI/Gemini連携、AWS CDKインフラ、CI/CD。 |
| 📐 **[コーディング規約 (docs/CODING_STANDARDS.md)](docs/CODING_STANDARDS.md)** | 設計原則、TypeScript/React規約、モジュラーCSS、命名規則、テスト方針。 |
| ☁️ **[AWS CDK バックエンド (cdk/README.md)](cdk/README.md)** | DynamoDB, Lambda, API Gateway のバックエンド構成とデプロイ手順。 |
| 📑 **[ドキュメントポータル (docs/README.md)](docs/README.md)** | ドキュメント一覧とナビゲーション。 |

---

## 🌟 主な学習機能 (Key Features Summary)

SpeakFlow は英語の「知識」を「とっさに使えるスピーキング力」へと昇華させるための統合学習システムです。

1. **🎭 AI 英会話ロールプレイ ＆ 総合診断 (Conversation Coach)**
   - 日常・ビジネスの多彩な実践シチュエーション ＆ 4段階難易度
   - Google Search Grounding による最新リアルタイムニュース会話シナリオ生成
   - リアルタイム音声認識 ＆ TTS 自動再生
   - 即時学習サポート（Better Phrasing、日本語訳トグル、3段階AI返答ヒント）
   - 終了時の 100 点満点総合診断レポート（文法・語彙・流暢さ・目標達成判定）

2. **⚡ 瞬間英作文 ＆ パターンプラクティス (Instant Oral Blitz)**
   - 瞬発力を鍛えるタイムアタック英作文（3秒・5秒・7秒・無制限タイマー）
   - 文法構文パターン集 ＆ AI カスタムお題自動生成（10問即時作成）
   - Gemini AI によるリアルタイム発話自動添削・合否判定・改善アドバイス
   - 音声認識テキストの手動修正機能 ＆ セッション振り返りレポート

3. **🎧 シャドーイング・スタジオ (Shadowing Studio)**
   - 音声追従によるリスニング・リズム・イントネーションの体得
   - カテゴリ別教材スクリプト ＆ 自由なカスタム英文貼り付け
   - 5段階スピードコントロール（0.5x 〜 1.5x）
   - 音声認識による発話一致率・精度スコアリング（%）

4. **💡 全画面常駐型 AI コーチングアシスタント (Floating Coach Widget)**
   - 画面右下のフローティングボタンから、いつでも日本語で学習相談
   - 画面コンテキスト自動認識（ホーム、対話中、シャドーイング中、英作文中の文脈に即応）

> 各機能の詳細な仕様や使い方は **[docs/FEATURES.md](docs/FEATURES.md)** をご覧ください。

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

### 4. 品質チェックコマンド
```bash
# 型チェック (TypeScript)
npm run typecheck

# 単体テスト実行 (Vitest 144 tests)
npm test

# リンター実行 (Oxlint)
npm run lint
```

---

## 🔑 Gemini API Key の設定方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセスし、API Key を作成します。
2. アプリ画面右上の **「API Key を設定」** ボタンをクリックします。
3. 取得した API Key を入力して保存します。（標準モデル: `gemini-3.5-flash-lite`）
4. API Key はブラウザの `LocalStorage` にのみ保存され、外部サーバーに送信されることはありません。

---

## 🛠️ 技術スタック概要 (Tech Stack Overview)

- **Frontend**: React 19, TypeScript 5.9, React Router 7, Vite 8
- **Styling**: Modular Vanilla CSS (Tokens, Base, Components, Features, Responsive)
- **AI Engine**: Google Gemini API (`gemini-3.5-flash-lite`, Google Search Grounding)
- **Speech Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Backend / IaC**: AWS CDK (TypeScript), AWS Lambda, Amazon DynamoDB (TTL), Amazon API Gateway
- **Testing & Quality**: Vitest (32 Files / 144 Tests), Oxlint, TypeScript strict mode
- **CI/CD & Hosting**: GitHub Actions (4段階品質ゲート), GitHub Pages

> システム構成図、ディレクトリ構成、AI/インフラ設計の詳細は **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** をご覧ください。

---

## 📜 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。自由にご利用・カスタマイズいただけます。
