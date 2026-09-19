# 🎓 SpeakFlow - AI 英会話 ＆ シャドーイング ＆ 瞬間英作文 トレーニング

<p align="center">
  <img src="public/favicon.svg" width="80" alt="SpeakFlow Logo" />
</p>

<p align="center">
  <b>Google Gemini API</b>（<code>gemini-3.5-flash-lite</code>）を搭載した、リアルタイム音声会話・実践的ロールプレイ・ニュース動的シナリオ生成・<b>シャドーイング音読特訓</b>・<b>瞬間英作文＆パターンプラクティス (Instant Oral Blitz)</b>・詳細スコア診断を提供する総合英会話学習 Web アプリケーション。
</p>

<p align="center">
  <a href="https://sabamiso-lab.github.io/ai-conversation-coach/">
    <img src="https://img.shields.io/badge/Demo-Live%20App-brightgreen?style=for-the-badge&logo=githubpages" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue.svg?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245.svg?logo=reactrouter" alt="React Router 7" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/AI%20Engine-Gemini%203.5%20Flash--Lite-8E44AD.svg?logo=google" alt="Gemini 3.5 Flash-Lite" />
  <img src="https://img.shields.io/badge/Backend-AWS%20CDK%20%2F%20DynamoDB-FF9900.svg?logo=amazonaws" alt="AWS CDK & DynamoDB" />
  <img src="https://img.shields.io/badge/Mobile-Responsive-green.svg" alt="Mobile Responsive" />
  <img src="https://img.shields.io/badge/Testing-Vitest-6E9F18.svg?logo=vitest" alt="Vitest" />
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
  - **リアルタイム AI コーチ相談 (Floating Coach Widget)**: 会話中に右下のウィジェットから日本語で自由に質問可能。「相手の発言のニュアンスは？」「この場面のマナーは？」「どう返答すべき？」など、現在の会話コンテキストを踏まえた助言とおすすめフレーズを即座に提示。
- **総合診断レポート**: 会話終了時に 100 点満点の総合スコア（文法・語彙・流暢さ）、改善ポイント、学んだ重要キーフレーズ集、目標達成判定をレポート出力。

### ⚡ 2. 瞬間英作文 ＆ パターンプラクティス (Instant Oral Blitz)
- **瞬発力スピーキング特訓**: 日本語プロンプトが表示されてから英語で即座に回答するタイムアタック形式の英作文トレーニング。
- **柔軟なタイマー設定**: 3秒（超高速・瞬発力特訓）、5秒（標準・テンポよく即答）、7秒（じっくり発話）、制限なし（自分のペース）から選択可能。
- **多彩なトレーニング問題 ＆ AI 自動生成**:
  - 文法構文パターン（助動詞・関係代名詞・仮定法など）、ビジネス即レス会話、日常・トラベル会話のプリセット問題集。
  - **AI カスタムお題生成**: 自由なテーマ入力に加え、サイコロアイコンによる「おまかせ自動選定」や人気トピックチップからワンタップでオリジナル問題を自動生成。
- **音声認識 ＆ キーボード入力両対応**: 複数の言い回しパターンや類似度スコアリングによる判定、文法ポイント解説、ネイティブ音声の確認が可能。
- **セッション結果サマリー**: 正解率、平均回答スピード、詳細振り返りレポートを表示。

### 🎧 3. シャドーイング・スタジオ (Shadowing Studio)
- **リスニング ＆ 音読追随トレーニング**: ネイティブ音声の再生に合わせて同時に発話し、リスニング力とスピーキング力を向上。
- **テーマ別スクリプト ＆ カスタム入力**: ビジネス、日常会話、ニュース、スピーチ等の豊富なカテゴリ教材に加え、手持ちの英文テキストを貼り付けて練習可能。
- **再生速度コントロール**: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x の再生スピード調整に対応。
- **音声認識による精度スコアリング**: マイクに向かって音読した内容をリアルタイム認識し、元のスクリプトとの単語一致率・テキスト類似度から精度スコア（%）を算出。

### ☁️ 4. AWS サーバーレス連携 ＆ セキュリティ
- **Amazon DynamoDB 動的シナリオ配信**: ロールプレイシナリオをクラウドから取得。生成されたニュースシナリオは TTL (Time To Live) により自動クリーニング。（※ 未設定時はローカルデータへ自動フォールバック）
- **多層セキュリティ防護**: CORS 制限、Lambda での Origin / Referer ドメイン検証、カスタム API Key ヘッダー照合による堅牢な保護。

### 📱 5. モバイル最適化レスポンシブ UI
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

### 5. 単体テストの実行 (Vitest)
```bash
# 全単体テストの実行
npm test

# ウォッチモードでのテスト実行
npm run test:watch
```

### 6. リンターの実行 (Oxlint)
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
- **高い対話・分析力**: 文法アドバイス、瞬間英作文の言い回し判定、会話全体の総合診断レポートを高精度に生成。
- **Google Search Grounding**: 最新のリアルタイムニュース情報を取得し、実践的な会話シナリオへ動的変換。

---

## 🚀 デプロイ / CI/CD Workflow

GitHub Actions を利用した GitHub Pages への自動デプロイが構築されています。

- `.github/workflows/deploy.yml` により、`main` ブランチへ `push` されると自動でテスト (`npm test`) ＆ビルド (`npm run build`) が実行され、`GitHub Pages` へデプロイされます。

---

## 📁 ディレクトリ構成 (Project Structure)

```
ai-conversation-coach/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages 自動デプロイワークフロー
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
├── index.html
├── package.json
├── vite.config.js              # Vite & Vitest 設定 (jsdom / テスト自動検知)
├── .oxlintrc.json                # Oxlint 設定
└── src/
    ├── main.jsx
    ├── App.jsx                   # ルーティング (React Router 7) & 全体レイアウト
    ├── index.css                 # デザインシステム (CSS Vanilla / モバイル対応)
    ├── pages/                    # メイン画面ページ
    │   ├── ConversationPage.jsx  # AI対話・ロールプレイ画面
    │   ├── ShadowingPage.jsx     # シャドーイング特訓画面
    │   └── InstantBlitzPage.jsx  # 瞬間英作文＆パターンプラクティス画面
    ├── features/                 # 機能別モジュール (コンポーネント・データ・テスト)
    │   ├── conversation/         # 会話関連 (ChatRoom, ChatSidebar, ChatInputBar, SituationSelector, ReportModal, HintPanel etc.)
    │   ├── shadowing/            # シャドーイング関連 (ShadowingPlayer, ShadowingAudioControls, ShadowingEvaluationCard, ShadowingSelector)
    │   └── blitz/                # 瞬間英作文関連 (BlitzSession, BlitzSummary, BlitzTopicSelector, blitzTopics.js)
    ├── components/               # 共通 UI コンポーネント
    │   └── common/
    │       ├── Header.jsx        # ヘッダー・ナビゲーション・ボトムナビゲーション
    │       ├── Modal.jsx         # 汎用モーダル (Overlay, Header, ESCキー検知, アクセシビリティ対応)
    │       ├── ApiKeyModal.jsx   # Gemini API Key 設定モーダル
    │       ├── DifficultyBadge.jsx # 難易度バッジ (Beginner / Intermediate / Advanced カラー自動判定)
    │       ├── CategoryFilter.jsx # カテゴリ切り替えピル型フィルターボタングループ
    │       ├── LoadingState.jsx  # 統一ローディングインジケーター (スピナー & メッセージ)
    │       ├── PageHeader.jsx    # ページ上部タイトルバナー (スタジオバッジ, 見出し, 説明文)
    │       ├── MicButton.jsx     # 音声認識 (マイク) トグルボタン (録音中アニメーション対応)
    │       ├── AiGeneratorCard.jsx # AI生成アコーディオンカード枠組み (グラデーション, Key警告, 開閉)
    │       ├── SuggestionChips.jsx # 話題例クイック選択チップス
    │       ├── Alert.jsx         # 汎用インラインアラート (error, warning, info, success)
    │       ├── StatCard.jsx      # 統計・スコア表示カード
    │       ├── FeedbackGrid.jsx  # AI診断フィードバック表示 (良かった点・改善点グリッド)
    │       ├── NewsCitation.jsx  # Grounding ニュース出典表示 (カード形式 / バッジ形式)
    │       ├── AudioPlayButton.jsx # 英文音声読み上げ (TTS) 統一ボタン (ラベル付き / アイコン形式)
    │       └── __tests__/        # 共通コンポーネント単体テスト
    ├── contexts/                 # React Context
    │   └── SettingsContext.jsx   # アプリ設定 (API Key, 選択モデル等) 状態管理
    ├── hooks/                    # カスタムフック
    │   ├── useChatSession.ts     # 会話セッション管理フック
    │   ├── useSettings.ts        # 設定アクセスフック
    │   └── useSpeechRecognition.ts # Web Speech API 音声認識共通フック
    ├── services/                 # 外部連携サービス層
    │   ├── ai/                   # Gemini API モジュール群
    │   │   ├── client.ts         # GoogleGenAI クライアント初期化・モデル管理
    │   │   ├── chat.js           # 会話ロールプレイ・ヒント・診断レポート生成
    │   │   ├── shadowing.js      # シャドーイング発話精度判定
    │   │   ├── blitz.js          # 瞬間英作文 AI お題自動生成
    │   │   └── news.js           # Grounding ニュースシナリオ動的生成
    │   ├── api.js                # DynamoDB API 通信 (GET/POST) ＆ ローカルフォールバック
    │   ├── gemini.js             # Gemini AI サービス統括エントリポイント
    │   └── speech.js             # Web Speech API (音声合成・重複再生防止)
    ├── data/                     # プリセットデータ・マスター定義
    │   ├── situations.ts         # 会話シチュエーション＆フォールバック定義
    │   ├── shadowingTopics.js    # シャドーイングテーマカテゴリ定義
    │   └── shadowingScripts.js   # シャドーイング英文スクリプト定義
    ├── types/                    # TypeScript 型定義
    │   └── index.ts              # アプリ全体の型定義 (Situation, Shadowing, Blitz 等)
    ├── utils/                    # ユーティリティ
    │   ├── jsonRepair.js         # Safe JSON Self-Healing パース関数
    │   ├── textMatcher.js        # テキスト正規化・単語一致率計算ユーティリティ
    │   └── __tests__/            # ユーティリティ単体テスト
    └── test/                     # テスト環境設定
        └── setup.js              # Vitest セットアップスクリプト
```

---

## 🛠️ 技術スタック (Tech Stack)

- **Frontend Core**: React 19, React Router 7, Vite 8
- **Styling / Layout**: Vanilla CSS (CSS Variables, Glassmorphism, Mobile Responsive, Fixed Bottom Navigation)
- **AI / LLM Engine**: Google Gemini API (`gemini-3.5-flash-lite`, Google Search Grounding)
- **Speech Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Backend / Infra**: AWS CDK, AWS Lambda, Amazon DynamoDB (TTL 有効), Amazon API Gateway (HTTP API)
- **Testing**: Vitest, React Testing Library
- **Linting**: Oxlint
- **Icons**: Lucide React
- **CI/CD & Hosting**: GitHub Actions, GitHub Pages

---

## 📐 コーディング規約 (Coding Standards)

プロジェクトの設計方針、コード品質、命名規則、TypeScript/React 規約、AI連携、テスト方針などの詳細は、以下のコーディング規約ドキュメントを参照してください：

👉 **[コーディング規約 (docs/CODING_STANDARDS.md)](docs/CODING_STANDARDS.md)**

---

## 📜 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。自由にご利用・カスタマイズいただけます。
