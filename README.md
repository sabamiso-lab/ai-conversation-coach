# 🎓 SpeakFlow - AI 英会話 ＆ シャドーイング ＆ 瞬間英作文 トレーニングアプリ

<p align="center">
  <img src="src/assets/react.svg" width="80" alt="SpeakFlow Logo" />
</p>

<p align="center">
  <b>Google Gemini API</b>（Gemini 3.5 Flash-Lite / 2.0 Flash 他）を搭載した、リアルタイム音声会話・実践的ロールプレイ・ニュース動的シナリオ生成・<b>シャドーイング音読特訓</b>・<b>瞬間英作文＆パターンプラクティス (Instant Oral Blitz)</b>・ネイティブ表現提案・詳細スコア診断を提供する総合英会話学習 Web アプリケーション。
</p>

<p align="center">
  <a href="https://sabamiso-lab.github.io/ai-conversation-coach/">
    <img src="https://img.shields.io/badge/Demo-Live%20App-brightgreen?style=for-the-badge&logo=githubpages" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue.svg?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245.svg?logo=reactrouter" alt="React Router 7" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/AI Engine-Gemini 3.5 Flash--Lite-8E44AD.svg?logo=google" alt="Gemini 3.5 Flash-Lite" />
  <img src="https://img.shields.io/badge/Backend-AWS%20CDK%20%2F%20DynamoDB-FF9900.svg?logo=amazonaws" alt="AWS CDK & DynamoDB" />
  <img src="https://img.shields.io/badge/Mobile-Responsive-green.svg" alt="Mobile Responsive" />
  <img src="https://img.shields.io/badge/Testing-Vitest-6E9F18.svg?logo=vitest" alt="Vitest" />
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

### 📱 1. モバイル・レスポンシブ UI ＆ ボトムナビゲーション (Mobile Layout)
- **スマートフォン最適化**: PC・タブレット・モバイル各種画面サイズに対応したフルレスポンシブデザイン。
- **ボトムナビゲーションバー**: モバイル表示時には直感的に切り替え可能な固定ボトムナビゲーション（会話対話 ⇆ シャドーイング ⇆ 瞬間英作文）を提供。
- **モバイル向け会話目標モーダル**: 省スペースなモバイル画面でもタップ一つでシナリオのミッション目標を確認可能。

### ⚡ 2. 【瞬間英作文 ＆ パターンプラクティス】 (Instant Oral Blitz)
- **瞬発力スピーキング特訓**: 日本語プロンプトが表示されてから英語で即座に回答するタイムアタック形式の英作文トレーニング。
- **カテゴリ別プリセット問題集**: 基礎構文パターン（助動詞・関係代名詞・仮定法など）、ビジネス即レス会話、日常・トラベル会話などの豊富なトレーニング問題。
- **タイマー ＆ 制限時間設定**: 1問あたりの制限時間（5秒〜30秒）を柔軟に設定でき、スピーキングの即応答スピードを鍛えられます。
- **AI カスタムお題生成 (Gemini AI)**: 「仮定法を使ったビジネス交渉」「カフェでの注文表現」など、自由にテーマを入力して Gemini AI にオリジナル問題を自動生成させることが可能。
- **音声認識 ＆ 多角的一致判定**: Web Speech API による音声認識とキーボード入力の両方に対応。複数の言い回しパターン（`acceptedAnswers`）や類似度スコアリングにより判定。
- **ポイント解説 ＆ お手本 TTS 再生**: 正解と同時に文法解説を表示し、ネイティブ音声をワンクリックで聞き直し可能。
- **セッション結果サマリー**: 正解率、平均回答スピード（秒）、各問の詳細な振り返りレポートを出力。

### 🎧 3. 【シャドーイング・スタジオ】 (Shadowing Studio)
- **リスニング ＆ 音読追随トレーニング**: ネイティブの音声再生に合わせて同時に発話（シャドーイング）するリスニング・スピーキング特訓機能。
- **テーマ別トピック選択**: ビジネス、日常会話、ニュース、旅・スピーチなど豊富なカテゴリからスクリプトを選択可能。
- **再生速度コントロール**: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x の柔軟な再生スピード調整に対応。
- **音声認識による精度比較**: マイクに向かって音読した発話内容をリアルタイム認識し、元のスクリプトと照合。
- **単語レベルの精度判定 ＆ スコアリング**: テキストの類似度・単語一致率を自動計算し、精度スコア（%）を出力。
- **カスタムスクリプト機能**: ニュース記事やオリジナルの英文テキストを自由に貼り付けて専用のシャドーイング教材を即時生成。

### 📰 4. 【最新ニュース AI シナリオ生成】 (Google Search Grounding)
- **ワンタップ最新ニュース検索**: テクノロジー、ビジネス、サイエンス、ワールドニュースなどの最新トレンドを AI が Google 検索経由でリアルタイム取得。
- **アコーディオン式 UI**: ニュース選択とカスタム入力がアコーディオン UI でスムーズに切り替え可能。
- **難易度別シナリオ動的生成**: `Beginner` / `Intermediate` / `Advanced` から難易度を選択でき、選択レベルに応じた語彙・構文・会話目標・要約を自動生成。
- **DynamoDB 自動同期 ＆ TTL**: 生成されたニュースシナリオはバックエンド API を通じて DynamoDB に自動保存され、TTL (Time To Live) 機能により一定期間後に自動クリーニングされます。

### 🎭 5. シチュエーション別ロールプレイ & DynamoDB 動的配信
- **多様な実用シーン**: カフェでの注文、空港チェックイン、ホテル予約、ビジネス進捗ミーティング、英語ジョブインタビュー、フリートークなど。
- **Amazon DynamoDB 連携**: シチュエーションデータは AWS DynamoDB から安全に動的配信されます。アプリの再ビルドなしで新しいシナリオを自由に追加・管理可能です。（※オフライン時は自動でローカルデータへフォールバックする安全設計）
- **難易度フィルター**: `Beginner` / `Intermediate` / `Advanced` / `Casual` の4段階でレベル指定が可能。
- **ミッション目標 (Goals)**: 各シナリオに明確な会話達成目標が設定されています。

### 🎙️ 6. 音声認識 ＆ 自動テキスト読み上げ (Speech-to-Text & TTS)
- **Web Speech API 連携 (`useSpeechRecognition`)**: マイクボタンを押して話しかけるだけで、リアルタイムで正確に音声認識＆文字起こし。
- **自然な発話再生**: AIの応答メッセージや模範解答をクリアな英語音声（Text-to-Speech）で自動再生。タイマーやイベントハンドラのクリーンアップにより重複再生を防止。

### ✨ 7. 「より自然なネイティブ表現 (Better Phrasing)」のリアルタイムアドバイス
- ユーザーの発言に対し、文法エラーや不自然な箇所をAIが即座に分析。
- 「こう言ったほうがよりネイティブらしく聞こえるよ！」という自然な表現提案と簡単なワンポイント解説をリアルタイム表示。自動サニタイズ処理により品質と視認性を向上。

### 💬 8. 日本語訳トグル ＆ 音声聞き直し
- ユーザー発話とAI応答（初期メッセージ含む）の両方に、ワンタップで切り替え可能な「日本語訳」を自動付与。
- いつでも発話内容を何度でも音声再生してリスニング学習が可能。

### 💡 9. 次に応答に困った時の「AIヒント提案」
- 会話中「次になんと言えばいいか分からない」ときにヒントボタンをタップ。
- AIが現在の会話文脈に合わせた3つの回答フレーズ（`Easy` / `Medium` / `Advanced`）を自動生成。

### 📊 10. 会話セッション総合診断レポート
- 会話を「終了して診断」すると、AIがセッション全体を総合分析。
- **スコア表示 (100点満点)**: 総合スコア + `Grammar (文法)` / `Vocabulary (語彙)` / `Fluency (会話の流れ)`
- **詳細フィードバック**: 良かった点・次回への改善ポイント。
- **今回学んだキーフレーズ集**: 実用的なフレーズと日本語訳の復習カードを出力。
- **目標達成チェック**: 設定されたシナリオ目標を達成できたかを自動判定。

### 🛡️ 11. 3重の API セキュリティ防護 & AWS バックエンド
- **CORS 制限**: 許可されたドメイン（`https://sabamiso-lab.github.io` および `localhost`）からのみアクセスを許可。
- **Origin / Referer ドメイン検証**: Lambda ハンドラー内でドメインを厳密判定し、直叩きや未許可サイトを排除。
- **x-speakflow-api-key カスタムヘッダー**: API Key 照合を行い、不正な呼び出しを防止。
- **POST API (シナリオ登録)**: クライアントやAIから動的シナリオを安全にDynamoDBへ追加保存。

### ⚡ 12. 高速 AI エンジン (Gemini 3.5 Flash-Lite) ＆ ループ防止 / JSON Self-Healing Parser
- 超高速応答の `gemini-3.5-flash-lite` を標準採用。API Key はブラウザの `LocalStorage` に安全に保管されます。
- **繰り返し会話ループ防止**: AIが同じ応答を繰り返さないようプロンプト制約および会話履歴制御を強化。
- 不完全な JSON レスポンスやトークン上限切れが発生しても、安全に修復・パースする Self-Healing ロジックを標準搭載。

---

## 📸 画面イメージ (Application Preview)

| 1. シチュエーション選択 & ニュース生成 | 2. リアルタイム音声対話画面 |
|:---:|:---:|
| トレンドニュース即時シナリオ化 & 難易度選択 | 音声入力・日本語訳・ネイティブ改善提案 |

| 3. 瞬間英作文 ＆ パターンプラクティス | 4. シャドーイング・スタジオ |
|:---:|:---:|
| タイムアタック即答特訓・AIカスタム問題生成 | テーマ別スクリプト・スピード変更・精度スコア |

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
DynamoDB API からシチュエーションを取得・追加する場合は、プロジェクトルート直下に `.env.local` を作成します：
```env
VITE_API_BASE_URL=https://xxxx.execute-api.ap-northeast-1.amazonaws.com/situations
VITE_API_KEY=sf_secret_key_speakflow_2026
```
*(※設定しない場合でも、自動的にローカルのフォールバックデータで動作します)*

### 4. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで [http://localhost:5173/ai-conversation-coach/](http://localhost:5173/ai-conversation-coach/) を開きます。

### 5. 単体テストの実行 (Vitest)
```bash
# 全単体テストの実行
npm test

# UIモードでのテスト実行
npm run test:ui
```

### 6. リンターの実行 (Oxlint)
```bash
npm run lint
```

---

## 🔑 Gemini API Key の設定方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセスし、無料の API Key を作成します。
2. アプリ画面右上の **「API Key を設定」** ボタンをクリックします。
3. 取得した API Key を入力して保存します。（使用モデル: `gemini-3.5-flash-lite` デフォルト）
4. ※ APIキーはブラウザの `LocalStorage` にローカル保存され、外部サーバーに送信されることは一切ありません。

---

## ☁️ AWS CDK バックエンドのデプロイ＆テスト方法

バックエンドインフラ（DynamoDB, Lambda, API Gateway）は AWS CDK (TypeScript) でコード化されています。

```bash
cd cdk
npm install

# CDK バックエンドの単体テスト実行
npm test

# AWS環境へのデプロイ
npx cdk bootstrap # 初回のみ
npx cdk deploy
```

デプロイ完了後に出力される `ApiEndpointUrl` および `ApiKeyHeaderValue` を、GitHub リポジトリの **Settings > Secrets and variables > Actions** に `VITE_API_BASE_URL` および `VITE_API_KEY` として追加することで、GitHub Pages 上のアプリに自動連携されます。

詳細な構成は [cdk/README.md](cdk/README.md) をご参照ください。

---

## 🤖 AI エンジン (Gemini Model)

SpeakFlow は **Google Gemini 3.5 Flash-Lite** を標準 AI エンジンとして採用しています。

| モデル名 | 特徴 | 用途 |
|:---|:---|:---|
| **`gemini-3.5-flash-lite`** *(標準)* | 超高速応答・リアルタイム対話・優れたコンテキスト理解 | リアルタイムロールプレイ、ニュース生成、瞬間英作文AI問題生成、ネイティブアドバイス、診断レポート |
| **`gemini-2.0-flash`** | 高精度レスポンス・汎用モデル | バックアップ/高度対話処理 |

---

## 🚀 デプロイ / CI/CD Workflow

GitHub Actions を利用した GitHub Pages への自動デプロイが構築されています。

- `.github/workflows/deploy.yml` により、`main` ブランチに `push` されると自動でテスト (`npm test`) ＆ビルド (`npm run build`) が実行され、`GitHub Pages` へ自動デプロイされます。

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
│   │   ├── getSituations.ts      # GET /situations Lambda ハンドラー (Origin/API Key検証)
│   │   └── createSituation.ts    # POST /situations Lambda ハンドラー (シナリオ追加)
│   ├── test/                     # Lambda / CDK スタック単体テスト (Vitest)
│   └── README.md
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js              # フロントエンド Vitest 設定
└── src/
    ├── main.jsx
    ├── App.jsx                   # ルーティング (React Router 7) & 全体レイアウト
    ├── App.css
    ├── index.css                 # Clean & Friendly デザインシステム (CSS Vanilla / モバイル対応)
    ├── pages/                    # メイン画面ビュー
    │   ├── ConversationPage.jsx  # AI対話・ロールプレイ画面
    │   ├── ShadowingPage.jsx     # シャドーイング特訓画面
    │   └── InstantBlitzPage.jsx  # 瞬間英作文＆パターンプラクティス画面
    ├── features/                 # 機能別モジュール
    │   ├── conversation/         # 会話関連コンポーネント (ChatRoom, SituationSelector, ReportModal, HintPanel etc.)
    │   ├── shadowing/            # シャドーイング関連コンポーネント (ShadowingPlayer, ShadowingSelector etc.)
    │   └── blitz/                # 瞬間英作文関連コンポーネント (BlitzSession, BlitzSummary, BlitzTopicSelector etc.)
    ├── components/               # 共通コンポーネント
    │   └── common/
    │       ├── Header.jsx        # ヘッダー・ナビゲーション・ボトムナビゲーション・APIキー/モデル設定
    │       └── ApiKeyModal.jsx   # Gemini API Key ＆ モデル選択モーダル
    ├── hooks/                    # カスタムフック
    │   └── useSpeechRecognition.js # Web Speech API 音声認識共通フック
    ├── services/                 # 各種 サービスモジュール
    │   ├── api.js                # DynamoDB API 通信 (GET/POST) ＆ フォールバック
    │   ├── gemini.js             # Gemini API 呼び出し (Grounding / Instant Blitz AI / Safe JSON / Chat / Report)
    │   └── speech.js             # Web Speech API (音声合成・重複再生防止)
    └── data/
        ├── situations.js         # シチュエーションデータ＆フォールバック定義
        ├── shadowingTopics.js    # シャドーイングテーマ・カテゴリ定義
        └── shadowingScripts.js   # シャドーイングスクリプト定義
```

---

## 🛠️ 技術スタック (Tech Stack)

- **Frontend Core**: React 19, React Router 7, Vite 8
- **UI / Responsive**: Mobile First Layout, Fixed Bottom Navigation, Custom CSS Tokens
- **Training Modules**: Real-time AI Conversation, Shadowing Studio, Instant Oral Blitz (瞬間英作文)
- **Backend / Infrastructure**: AWS CDK, AWS Lambda, Amazon DynamoDB (TTL有効), Amazon API Gateway (HTTP API)
- **AI / LLM Engine**: Google Gemini API (`gemini-3.5-flash-lite` デフォルト, Google Search Grounding)
- **Speech Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`, Custom Hooks)
- **Testing**: Vitest, React Testing Library
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Oxlint](https://github.com/oxc-project/oxc)
- **CI/CD & Hosting**: GitHub Actions, GitHub Pages
- **Design System**: Vanilla CSS (Custom Tokens, Glassmorphism, Responsive UI)

---

## 📜 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。自由にご利用・カスタマイズいただけます。
