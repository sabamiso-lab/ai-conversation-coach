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

SpeakFlow は GitHub Pages にて公開されています。以下のリンクからすぐにお試しいただけます：

👉 **[SpeakFlow Web App を試す](https://sabamiso-lab.github.io/ai-conversation-coach/)**

*(※ ご利用にはご自身の Google Gemini API Key が必要です。API Key はブラウザの `LocalStorage` に安全にローカル保存されます。)*

---

## 🌟 主な機能 (Key Features)

### 🎭 1. AI 英会話ロールプレイ ＆ 総合診断 (Conversation Coach)
- **実践的シチュエーション ＆ レベル選択**: カフェ注文、空港チェックイン、ホテル予約、ビジネス会議、面接、フリートーク等、4段階の難易度（`Beginner` / `Intermediate` / `Advanced` / `Casual`）から選択可能。各シナリオに達成目標（Goals）を設定。
- **最新ニュース AI シナリオ生成 (Google Search Grounding)**: テクノロジー、ビジネス、サイエンス、国際情勢などの最新トレンドを AI が Google 検索経由で取得し、選択レベルに応じた対話シナリオをリアルタイム生成。
- **リアルタイム音声認識 ＆ TTS 再生**: Web Speech API による高精度なマイク入力と、ネイティブ音声による自動テキスト読み上げ。
- **即時学習サポート**:
  - **Better Phrasing**: ユーザーの発話に対し、文法やニュアンスをより自然にしたネイティブ表現とワンポイントアドバイスをリアルタイム表示。
  - **日本語訳トグル**: ユーザー発話と AI 応答の両方をワンタップで日本語表示切り替え。
  - **AI 応答ヒント**: 返答に困った際、文脈に沿った3段階（Easy / Medium / Advanced）の回答候補を提示。
- **総合診断レポート**: 会話終了時に 100 点満点の総合スコア（文法・語彙・流暢さ）、改善ポイント、学んだ重要キーフレーズ集、目標達成判定をレポート出力。

### ⚡ 2. 瞬間英作文 ＆ パターンプラクティス (Instant Oral Blitz)
- **瞬発力スピーキング特訓**: 日本語プロンプトが表示されてから英語で即座に回答するタイムアタック形式の英作文トレーニング。
- **柔軟なタイマー設定**: 3秒（超高速・瞬発力特訓）、5秒（標準・テンポよく即答）、7秒（じっくり発話）、制限なし（自分のペース）から選択可能。
- **多彩なトレーニング問題 ＆ AI 自動生成**:
  - 文法構文パターン（助動詞・関係代名詞・仮定法など）、ビジネス即レス会話、日常・トラベル会話の豊富なプリセット問題集。
  - **AI カスタムお題生成**: 自由なテーマ入力に加え、サイコロアイコンによる「おまかせ自動選定」や人気トピックチップからワンタップでオリジナル問題を10問自動生成。
- **🤖 Gemini AI によるリアルタイム発話自動添削・フィードバック**:
  - 音声認識またはテキスト入力されたユーザーの発話を、Gemini AI が即座に自動評価。
  - 単なる正解例との一致判定だけでなく、「意味が通じるか」「文法的に自然か」「より良い言い回し」「改善アドバイス」を瞬時にフィードバック。
- **発話テキスト手動編集機能**: 音声認識の聞き間違いがあった場合でも、ワンタップでテキストを直接編集して即座に AI 評価を再実行可能。
- **セッション結果サマリー**: 正解率、平均回答スピード、各問の AI 添削結果を含む詳細振り返りレポートを表示。

### 🎧 3. シャドーイング・スタジオ (Shadowing Studio)
- **リスニング ＆ 音読追随トレーニング**: ネイティブ音声の再生に合わせて同時に発話し、リスニング力とスピーキング力を向上。
- **テーマ別スクリプト ＆ カスタム入力**: ビジネス、日常会話、ニュース、スピーチ等の豊富なカテゴリ教材に加え、手持ちの英文テキストを貼り付けて練習可能。
- **再生速度コントロール**: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x の再生スピード調整に対応。
- **音声認識による精度スコアリング**: マイクに向かって音読した内容をリアルタイム認識し、元のスクリプトとの単語一致率・テキスト類似度から精度スコア（%）を算出。

### 💡 4. 全画面常駐型 AI コーチングアシスタント (Floating Coach Widget)
- **あらゆる画面でいつでも日本語相談**: 画面右下のフローティングボタンから、学習中いつでも専任 AI コーチを呼び出し可能。
- **シチュエーション連動のコンテキスト認識**:
  - **ホーム（選択画面）**: 「初心者におすすめのシチュエーションは？」「効果的な学習順序は？」など学習全般を相談。
  - **ロールプレイ会話中**: 「相手の発言のニュアンスは？」「この場面のマナーは？」「どう返答すべき？」など会話コンテキストを踏まえた助言とおすすめフレーズを即座に提示。
  - **シャドーイング特訓中**: 選択中の英文スクリプトを自動把握し、文法構文の解説、単語のニュアンス、発音・リエゾンのコツを解説。
  - **瞬間英作文セッション中**: 出題中の問題やテーマを踏まえ、「他の言い回しはある？」「ネイティブはどちらをよく使う？」といった別解・ニュアンスの疑問を即時解消。

### ☁️ 5. AWS サーバーレス連携 ＆ セキュリティ
- **Amazon DynamoDB 動的シナリオ配信**: ロールプレイシナリオをクラウドから取得。生成されたニュースシナリオは TTL (Time To Live) により自動クリーニング。（※ 未設定時はローカルデータへ自動フォールバック）
- **多層セキュリティ防護**: CORS 制限、Lambda での Origin / Referer ドメイン検証、カスタム API Key ヘッダー照合による堅牢な保護。

### 📱 6. モバイル最適化レスポンシブ UI
- スマートフォン、タブレット、PC すべての画面サイズに対応したレスポンシブ設計。
- モバイル表示時は固定ボトムナビゲーション（会話 ⇆ シャドーイング ⇆ 瞬間英作文）で快適に画面遷移が可能。

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

### 3. 環境変数の設定 (オプション)
DynamoDB API からシチュエーションを取得・登録する場合は、プロジェクトルート直下に `.env.local` を作成します：
```env
VITE_API_BASE_URL=https://xxxx.execute-api.ap-northeast-1.amazonaws.com/situations
VITE_API_KEY=sf_secret_key_speakflow_2026
```
*(※ 設定しない場合でも、自動的にローカルのフォールバックデータで全機能が動作します)*

### 4. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで [http://localhost:5173/ai-conversation-coach/](http://localhost:5173/ai-conversation-coach/) を開きます。

### 5. 型チェックの実行 (TypeScript)
```bash
npm run typecheck
```

### 6. 単体テストの実行 (Vitest)
```bash
# 全単体テストの実行 (全32テストファイル / 144 テスト)
npm test

# ウォッチモードでのテスト実行
npm run test:watch
```

### 7. リンターの実行 (Oxlint)
```bash
npm run lint
```

---

## 🔑 Gemini API Key の設定方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセスし、API Key を作成します。
2. アプリ画面右上の **「API Key を設定」** ボタンをクリックします。
3. 取得した API Key を入力して保存します。（標準モデル: `gemini-3.5-flash-lite`）
4. API Key はブラウザの `LocalStorage` にのみ保存され、外部サーバーに送信されることはありません。

---

## ☁️ AWS CDK バックエンドのデプロイ＆テスト

バックエンドインフラ（DynamoDB, Lambda, API Gateway）は AWS CDK (TypeScript) で構築されています。

```bash
cd cdk
npm install

# CDK バックエンドの単体テスト実行
npm test

# AWS環境へのデプロイ
npx cdk bootstrap # 初回のみ
npx cdk deploy
```

デプロイ完了後に出力される `ApiEndpointUrl` および `ApiKeyHeaderValue` を、GitHub リポジトリの **Settings > Secrets and variables > Actions** に `VITE_API_BASE_URL` および `VITE_API_KEY` として登録することで、GitHub Pages 上のアプリに自動連携されます。

詳細は [cdk/README.md](cdk/README.md) をご参照ください。

---

## 🤖 AI エンジン (Gemini Model)

SpeakFlow は **Google Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`)** を標準 AI エンジンとして採用しています。

- **超高速応答**: リアルタイムな会話テンポを損なわない低レイテンシ応答。
- **高い対話・分析力**: 文法アドバイス、瞬間英作文の発話自動添削、会話全体の総合診断レポートを高精度に生成。
- **Google Search Grounding**: 最新のリアルタイムニュース情報を取得し、実践的な会話シナリオへ動的変換。
- **多面的な学習サポート**: ロールプレイ対話、シャドーイング精度判定、瞬間英作文のお題生成＆自動添削、全画面常駐 AI コーチ相談の全領域でフル活用。

---

## 🚀 デプロイ / CI/CD Workflow

GitHub Actions を利用した GitHub Pages への自動デプロイが構築されています。

- `.github/workflows/deploy.yml` により、`main` ブランチへ `push` されると、**4段階の品質ゲート（Lint → Typecheck → Test → Build）** が自動実行され、すべてパスした場合のみ `GitHub Pages` へ安全に自動デプロイされます。

---

## 📁 ディレクトリ構成 (Project Structure)

```
ai-conversation-coach/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI 品質ゲート (Lint, Typecheck, Test, Build) & Pages 自動デプロイ
├── cdk/                          # AWS CDK バックエンドインフラ (TypeScript)
│   ├── bin/cdk.ts                # CDK エントリポイント
│   ├── lib/
│   │   └── speakflow-backend-stack.ts # DynamoDB, Lambda, API Gateway 定義
│   ├── lambda/
│   │   ├── getSituations.ts      # GET /situations Lambda ハンドラー
│   │   ├── createSituation.ts    # POST /situations Lambda ハンドラー
│   │   └── __tests__/            # Lambda 単体テスト
│   ├── cdk.json
│   ├── tsconfig.json
│   ├── vitest.config.ts          # CDK 単体テスト設定
│   └── README.md
├── docs/                         # プロジェクトドキュメント
│   └── CODING_STANDARDS.md       # 設計方針・コーディング規約
├── public/
│   └── favicon.svg               # SpeakFlow ロゴ・ファビコン
├── index.html
├── package.json
├── tsconfig.json                 # TypeScript 設定 (strict, bundler module resolution)
├── vite.config.js                # Vite & Vitest 設定 (jsdom / テスト自動検知)
├── .env.example                  # 環境変数テンプレート
├── .oxlintrc.json                # Oxlint 設定
└── src/
    ├── main.tsx                  # アプリケーションエントリポイント
    ├── App.tsx                   # ルーティング (React Router 7) & 全体レイアウト
    ├── vite-env.d.ts             # Vite 環境変数・クライアント型定義
    ├── index.css                 # スタイル統合エントリポイント (@import 集約)
    ├── styles/                   # モジュラー CSS アーキテクチャ
    │   ├── tokens.css            # デザイントークン (色・フォント・シャドウ・角丸)
    │   ├── base.css              # リセット・基本レイアウト・共通アニメーション・ユーティリティ
    │   ├── components.css        # 共通 UI スタイル (ヘッダー、ナビ、ボタン、モーダル、フォーム)
    │   ├── responsive.css        # モバイル固定ボトムナビ・メディアクエリ
    │   └── features/             # 各機能ドメイン固有スタイル
    │       ├── conversation.css  # 会話ロールプレイ・チャットルーム・バブル・レポート
    │       ├── blitz.css         # 瞬間英作文・タイマー・発話・AI自動添削カード
    │       ├── shadowing.css     # シャドーイングプレイヤー・評価グリッド
    │       └── coach.css         # フローティング AI コーチ (FAB・パネル・フレーズ)
    ├── pages/                    # メイン画面ページ (TSX)
    │   ├── ConversationPage.tsx  # AI対話・ロールプレイ画面
    │   ├── ShadowingPage.tsx     # シャドーイング特訓画面
    │   └── InstantBlitzPage.tsx  # 瞬間英作文＆パターンプラクティス画面
    ├── features/                 # 機能別モジュール (UI + ロジック + テスト)
    │   ├── conversation/         # 会話関連 (ChatRoom, ChatSidebar, ChatInputBar, FloatingCoachWidget, etc.)
    │   ├── shadowing/            # シャドーイング関連 (ShadowingPlayer, ShadowingScriptViewer, ShadowingAudioControls, etc.)
    │   └── blitz/                # 瞬間英作文関連 (BlitzSession, BlitzTopicSelector, BlitzSpeechBox, BlitzAnswerPanel, BlitzEvaluationPanel, useBlitzTimer, etc.)
    ├── components/               # 共通 UI コンポーネント
    │   └── common/
    │       ├── Header.tsx        # ヘッダー・ナビゲーション・ボトムナビ
    │       ├── Modal.jsx         # 汎用モーダル
    │       ├── ApiKeyModal.jsx   # Gemini API Key 設定モーダル
    │       ├── DifficultyBadge.jsx
    │       ├── CategoryFilter.jsx
    │       ├── LoadingState.jsx
    │       ├── PageHeader.jsx
    │       ├── MicButton.jsx
    │       ├── AiGeneratorCard.jsx
    │       ├── SuggestionChips.jsx
    │       ├── Alert.jsx
    │       ├── StatCard.jsx
    │       ├── FeedbackGrid.jsx
    │       ├── NewsCitation.jsx
    │       ├── AudioPlayButton.jsx
    │       └── __tests__/        # 共通コンポーネント単体テスト群
    ├── contexts/                 # React Context
    │   └── SettingsContext.tsx   # アプリ設定 (API Key, 選択モデル) 状態管理
    ├── hooks/                    # カスタムフック
    │   ├── useChatSession.ts     # 会話セッション管理フック
    │   ├── useConversationCoach.ts # 全画面常駐 AI コーチ相談フック
    │   ├── useSettings.ts        # 設定アクセスフック (Provider 外安全フォールバック内蔵)
    │   └── useSpeechRecognition.ts # Web Speech API 音声認識フック
    ├── services/                 # 外部連携サービス層 (完全 TypeScript 化)
    │   ├── ai/                   # Gemini API モジュール群
    │   │   ├── client.ts         # GoogleGenAI クライアント初期化
    │   │   ├── chat.ts           # 会話ロールプレイ・ヒント・診断レポート生成
    │   │   ├── coach.ts          # 常駐 AI コーチ（質問・回答・フレーズ提案）
    │   │   ├── shadowing.ts      # シャドーイング発話精度判定
    │   │   ├── blitz.ts          # 瞬間英作文 AI お題自動生成 ＆ 発話自動添削
    │   │   ├── news.ts           # Grounding ニュースシナリオ動的生成
    │   │   └── __tests__/        # AI サービス単体テスト
    │   ├── api.ts                # DynamoDB API 通信 (GET/POST) ＆ ローカルフォールバック
    │   ├── gemini.ts             # Gemini AI サービス統括エントリポイント
    │   ├── speech.ts             # Web Speech API (音声合成・認識)
    │   └── __tests__/            # サービス層単体テスト
    ├── data/                     # プリセットデータ・マスター定義
    │   ├── situations.ts         # 会話シチュエーション＆フォールバック定義
    │   ├── shadowingTopics.js    # シャドーイングテーマカテゴリ定義
    │   └── shadowingScripts.js   # シャドーイング英文スクリプト定義
    ├── types/                    # TypeScript 型定義
    │   └── index.ts              # アプリ全体の型定義 (Situation, Shadowing, Blitz, Coach 等)
    ├── utils/                    # ユーティリティ (TypeScript)
    │   ├── jsonRepair.ts         # Safe JSON Self-Healing パース関数
    │   ├── textMatcher.ts        # テキスト正規化・単語一致率計算ユーティリティ
    │   └── __tests__/            # ユーティリティ単体テスト
    └── test/                     # テスト環境設定
        └── setup.js              # Vitest セットアップスクリプト
```

---

## 🛠️ 技術スタック (Tech Stack)

- **Frontend Core**: React 19, TypeScript 5.9, React Router 7, Vite 8
- **Styling / Layout**: Modular Vanilla CSS (Design Tokens, Base, Components, Features, Responsive Media Queries)
- **AI / LLM Engine**: Google Gemini API (`gemini-3.5-flash-lite`, Google Search Grounding)
- **Speech Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Backend / Infra**: AWS CDK, AWS Lambda, Amazon DynamoDB (TTL 有効), Amazon API Gateway (HTTP API)
- **Testing**: Vitest (32 Test Files / 144 Tests passing), React Testing Library
- **Linting & Type Checking**: Oxlint, TypeScript (`tsc --noEmit`)
- **Icons**: Lucide React
- **CI/CD & Hosting**: GitHub Actions (4-stage Quality Gate), GitHub Pages


---

## 📐 コーディング規約 (Coding Standards)

プロジェクトの設計方針、コード品質、命名規則、TypeScript/React 規約、AI連携、テスト方針などの詳細は、以下のコーディング規約ドキュメントを参照してください：

👉 **[コーディング規約 (docs/CODING_STANDARDS.md)](docs/CODING_STANDARDS.md)**

---

## 📜 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。自由にご利用・カスタマイズいただけます。
