# 📐 SpeakFlow コーディング規約 (Coding Standards & Guidelines)

本書は、**SpeakFlow (AI 英会話・シャドーイング・瞬間英作文 トレーニング)** プロジェクトにおける設計原則、コード品質、命名規則、および開発プロセスに関する統一ガイドラインです。  
新規機能の開発、リファクタリング、およびコードレビュー時は本規約に準拠してください。

---

## 目次

1. [基本設計原則 (Core Principles)](#1-基本設計原則-core-principles)
2. [アーキテクチャとディレクトリ構成 (Architecture & Directory Structure)](#2-アーキテクチャとディレクトリ構成-architecture--directory-structure)
3. [命名規則 (Naming Conventions)](#3-命名規則-naming-conventions)
4. [TypeScript / JavaScript 規約](#4-typescript--javascript-規約)
5. [React 19 コンポーネント規約](#5-react-19-コンポーネント規約)
6. [スタイリング規約 (CSS)](#6-スタイリング規約-css)
7. [AI (Google Gemini API) 実装規約](#7-ai-google-gemini-api-実装規約)
8. [AWS CDK & Lambda 規約](#8-aws-cdk--lambda-規約)
9. [テスト & 品質管理規約 (Testing & Quality Assurance)](#9-テスト--品質管理規約-testing--quality-assurance)

---

## 1. 基本設計原則 (Core Principles)

### 1.1. TypeScript First & 漸進的型付け
- 新規に作成するロジックファイルやコンポーネントは、原則として **TypeScript (`.ts` / `.tsx`)** で実装します。
- 既存の JavaScript (`.jsx` / `.js`) は段階的にリファクタリング・移行しますが、既存コードを改修する際にも型定義（JSDoc または TS化）を意識します。
- 型定義は `src/types/index.ts` に集約、または機能モジュール固有の型として明示します。

### 1.2. Graceful Degradation (堅牢なフォールバック設計)
- 外部 API（Gemini API、AWS DynamoDB API、Web Speech API）がオフラインやエラー、または未設定の場合でも、アプリ全体がクラッシュせずローカルデータへ自動フォールバックする設計を徹底します。
- ユーザーに適切なフィードバック（エラーメッセージ、ローディング表示、リトライ手段）を必ず提示します。

### 1.3. AI-Native な設計と堅牢性
- LLM（Gemini API）のレスポンスは不確実性を伴います。構造化出力（`responseSchema` / JSON Mode）を基本とし、受け取り側で必ずバリデーションおよび修復ユーティリティ（`repairJson` 等）を経由させます。
- モデル名などの設定値はハードコードせず定数（`DEFAULT_MODEL`）で管理します。

### 1.4. Clean Architecture & Feature-Driven
- 機能ドメイン（ロールプレイ、シャドーイング、瞬間英作文）ごとに凝集した `features/` ディレクトリ構成を採用し、汎用UI部品（`components/common/`）やインフラ層と疎結合を保ちます。

---

## 2. アーキテクチャとディレクトリ構成 (Architecture & Directory Structure)

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI 4段階品質ゲート (Lint, Typecheck, Test, Build) & 自動デプロイ
├── cdk/                    # AWS CDK インフラコード & Lambda バックエンド
│   ├── bin/                # CDK エントリーポイント
│   ├── lambda/             # Lambda ハンドラー関数 & 単体テスト
│   └── lib/                # CDK スタック定義 (DynamoDB, API Gateway等)
├── docs/                   # プロジェクト各種ドキュメント
├── public/                 # 静的アセット (favicon, アイコン等)
├── tsconfig.json           # ルート TypeScript 設定 (strict, bundler module resolution)
├── src/                    # フロントエンド アプリケーションコード
│   ├── components/
│   │   └── common/         # プロジェクト共通の UI コンポーネント
│   ├── contexts/           # React Context (SettingsContext.tsx など広域状態)
│   ├── data/               # 静的データ・デフォルトシナリオ・フォールバック
│   ├── features/           # 機能ドメイン別のコード (UI + ロジック + テスト)
│   │   ├── blitz/          # 瞬間英作文 (Session, AnswerPanel, EvalPanel, SpeechBox, useBlitzTimer)
│   │   ├── conversation/   # 会話ロールプレイ (ChatRoom, Sidebar, InputBar, CoachWidget)
│   │   └── shadowing/      # シャドーイング (Player, ScriptViewer, AudioControls, EvalCard)
│   ├── hooks/              # 再利用可能なカスタムフック (useSettings, useBlitzTimer 等)
│   ├── pages/              # 画面ルーティング単位のトップレベルページ (TSX)
│   ├── services/           # 外部通信・AI・API クライアント (完全 TypeScript 化)
│   │   └── ai/             # Gemini API 呼び出しモジュール (client, chat, coach, blitz, shadowing, news)
│   ├── styles/             # モジュラー CSS アーキテクチャ
│   │   ├── tokens.css      # デザイントークン (色、余白、タイポグラフィ、シャドウ)
│   │   ├── base.css        # リセット・レイアウト・共通アニメーション・ユーティリティ
│   │   ├── components.css  # 共通 UI コンポーネントスタイル
│   │   ├── responsive.css  # モバイル固定ボトムナビ・メディアクエリ
│   │   └── features/       # 各機能ドメイン固有スタイル (*.css)
│   ├── types/              # TypeScript 型定義 (ドメインモデル等 index.ts)
│   ├── utils/              # 汎用ヘルパー・修復関数 (TypeScript)
│   ├── index.css           # スタイル統合エントリポイント (@import 集約)
│   ├── main.tsx            # アプリケーションエントリポイント
│   ├── App.tsx             # ルーティング & 全体レイアウト
│   └── vite-env.d.ts       # Vite クライアント型定義
└── index.html              # HTML テンプレート
```

### ディレクトリ別の責務ルール
- **`components/common/`**: ドメイン知識を持たない純粋なUI部品（`Header`, `Button`, `Modal`, `LoadingState`, `DifficultyBadge` など）。
- **`features/<domain>/`**: その機能に特化したコンポーネント、サブコンポーネント、専用カスタムフック、およびテストを配置。他の feature に依存しない独立性を保ちます。
- **`styles/`**: CSS を責務別に分割（Tokens, Base, Components, Features, Responsive）。巨大な単一ファイルを避け、保守性を向上させます。
- **`services/`**: ビジネスロジックや外部通信（HTTP fetch、Gemini SDK、Web Speech API）をカプセル化。React の状態（`useState` 等）を持たず、純粋な非同期関数として TypeScript で実装します。
- **`hooks/`**: UIとサービスの橋渡しを行い、状態管理や副作用ライフサイクルをカプセル化します。
- **`contexts/`**: 広域で共有する状態（API Key、選択モデルなど）を保持。カスタムフック経由（`useSettings()`）で安全にアクセスし、不要なバケツリレー（Prop Drilling）を防ぎます。


---

## 3. 命名規則 (Naming Conventions)

### 3.1. ファイル・ディレクトリ命名
| 種別 | 命名規則 | 例 |
| :--- | :--- | :--- |
| React コンポーネント | **PascalCase** | `ChatRoom.jsx`, `MicButton.tsx` |
| カスタムフック | **camelCase** (`use` プレフィックス) | `useChatSession.ts`, `useSettings.ts` |
| ユーティリティ・サービス | **camelCase** | `jsonRepair.js`, `api.ts`, `gemini.ts` |
| 型定義ファイル | **camelCase** または `index.ts` | `index.ts`, `blitzTypes.ts` |
| テストファイル | `*.test.ts`, `*.test.tsx`, `*.test.js` | `api.test.js`, `getSituations.test.ts` |
| ディレクトリ名 | **camelCase** または **kebab-case** | `common`, `conversation`, `services` |

### 3.2. 識別子 (Identifiers) の命名
| 対象 | 命名規則 | 例 / 説明 |
| :--- | :--- | :--- |
| **変数・関数** | `camelCase` | `inputText`, `fetchSituations()` |
| **真偽値 (Boolean)** | `is*`, `has*`, `should*`, `can*` | `isAiThinking`, `hasApiKey`, `shouldScroll` |
| **定数 (Constants)** | `UPPER_SNAKE_CASE` | `DEFAULT_MODEL`, `MAX_RETRIES` |
| **型・Interface** | `PascalCase` | `ChatMessage`, `Situation`, `SessionReport` |
| **Event Props** | `on<Event>` | `onSelectSituation`, `onOpenApiKeyModal` |
| **Event Handler 関数** | `handle<Event>` | `handleSubmit`, `handleMicClick` |

```typescript
// ✅ Good
const [isReportLoading, setIsReportLoading] = useState(false);

const handleSendMessage = useCallback(() => {
  if (!inputText.trim()) return;
  // ...
}, [inputText]);

<SituationSelector onSelectSituation={handleSelect} />

// ❌ Bad
const [loading, setLoading] = useState(false); // 何のローディングか曖昧
const click = () => {}; // 動詞単体で不明瞭
<SituationSelector clickSituation={click} /> // on プレフィックスがない
```

---

## 4. TypeScript / JavaScript 規約

### 4.1. 型安全性の確保
- **`any` の原則禁止**: 型が不明な場合は `unknown` を使用し、Type Guard や Zod/型絞り込みを活用してください。
- **オブジェクトや配列の型指定**: インラインでの複雑な型指定は避け、`interface` または `type` を `src/types/index.ts` に定義します。
- **マスターデータとの型整合**: `src/data/` の静的データは `src/types/` の型定義に準拠させ、二重定義や不整合を排除します。

```typescript
// ✅ Good: ドメイン型の定義 (src/types/index.ts)
export interface Situation {
  id: string;
  title: string;
  titleJa: string;
  category: 'daily' | 'business' | 'travel' | 'casual';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  description: string;
  initialMessage: string;
  initialMessageJa: string;
  goals: string[];
}

export interface BlitzQuestion {
  id: string;
  japanese: string;
  english: string;
  grammarPoint: string;
  explanation?: string;
  topicCategory: string;
}

// ❌ Bad: any の安易な使用やアドホックな型定義
export function processSituation(data: any) { ... }
```

### 4.2. Prop Drilling の排除と Context 活用
- 複数階層にわたる `apiKey`, `model`, `onOpenApiKeyModal` などのバケツリレー（Prop Drilling）は行いません。
- `useSettings()` カスタムフックを使用し、コンポーネント自身が必要な設定を取得します。
- **Provider 外フォールバック設計**: テストコード等で `SettingsProvider` のツリー外でコンポーネントがレンダリングされた場合でもクラッシュしないよう、`useSettings()` は安全なデフォルトフォールバックを返す規約とします。

```typescript
// ✅ Good: コンポーネント内で直接 useSettings を利用
export default function InstantBlitzPage() {
  const settings = useSettings();
  const apiKey = settings.apiKey;
  // ...
}

// ❌ Bad: 親から何階層も props をリレー
<Parent apiKey={apiKey} model={model}>
  <Child apiKey={apiKey} model={model}>
    <GrandChild apiKey={apiKey} model={model} />
  </Child>
</Parent>
```


### 4.3. 不変性 (Immutability) の徹底
- React の State や配列、オブジェクトのプロパティを直接変更（破壊的操作）してはいけません。スプレッド構文や `map`, `filter` を使用します。

```typescript
// ✅ Good
setMessages(prev => [...prev, newMessage]);

// ❌ Bad
messages.push(newMessage);
setMessages(messages);
```

### 4.4. Modern Syntax の活用
- Null チェックには **Optional Chaining (`?.`)** および **Nullish Coalescing (`??`)** を使用します。
- `var` の使用は全面禁止。再代入を行わない変数はすべて `const` とし、必要な場合のみ `let` を使用します。

```typescript
// ✅ Good
const initialJa = situation?.initialMessageJa ?? situation?.initialMessageTranslation ?? '';
```

### 4.5. 非同期処理とエラーハンドリング

- `Promise.then()` のネストは避け、**`async / await`** で統一します。
- 外部通信には必ず `try-catch` を配置し、握りつぶさずにログ出力やフォールバック処理を行います。

```typescript
// ✅ Good
try {
  const result = await callGeminiApi(apiKey, model, systemInstruction, contents);
  return parseResponse(result);
} catch (error) {
  console.error('[Gemini Service] API Call failed:', error);
  throw new Error('AIとの通信に失敗しました。時間をおいて再試行してください。');
}
```

---

## 5. React 19 コンポーネント規約

### 5.1. 関数コンポーネントと Props
- すべてのコンポーネントは関数コンポーネント（Functional Component）で記述します。
- Props は引数で分割代入し、必要に応じてデフォルト値を設定します。

```tsx
// ✅ Good
interface DifficultyBadgeProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'casual';
  size?: 'sm' | 'md';
}

export function DifficultyBadge({ difficulty, size = 'md' }: DifficultyBadgeProps) {
  return (
    <span className={`badge badge-${difficulty} badge-${size}`}>
      {difficulty.toUpperCase()}
    </span>
  );
}
```

### 5.2. フックの利用ルール (Rules of Hooks)
- Linter (`oxlint`) の `react/rules-of-hooks` に従い、フックをループ、条件分岐、ネストされた関数の中で呼び出してはなりません。
- **`useEffect` の最小化**: Props や既存の State から計算できる派生データは、レンダリング時にインラインで計算します（無駄な `useEffect` + State 更新を避ける）。

```tsx
// ✅ Good: レンダリング時に計算
const completedCount = useMemo(() => goals.filter(g => g.completed).length, [goals]);

// ❌ Bad: 不要な State と Effect
const [completedCount, setCompletedCount] = useState(0);
useEffect(() => {
  setCompletedCount(goals.filter(g => g.completed).length);
}, [goals]);
```

### 5.3. メモ化の判断基準
- すべてを闇雲に `useCallback` / `useMemo` でラップするのではなく、以下のケースで適用します：
  1. 子コンポーネントにコールバックを渡し、その子コンポーネントが `React.memo` 化されている場合
  2. 他のフック（`useEffect` やカスタムフック）の依存配列に含まれる関数・オブジェクト
  3. 配列のフィルタリングや集計など計算コストが高い処理

### 5.4. 早期リターン (Early Return)
- ネストが深くならないよう、ガード節（Guard Clause）を用いて早期リターンします。

```tsx
// ✅ Good
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
if (!data) return <EmptyState />;

return <DataView data={data} />;
```

### 5.5. 巨大コンポーネントの責任分離とカスタムフック抽出
- 300行を超える巨大コンポーネントは、以下の観点で分割を検討します：
  1. **複雑なタイマーやステートマシンのフック化**: `useBlitzTimer` のように、カウントダウン・タイムアウト・リセットなどの副作用ロジックを独立したカスタムフックに抽出して単体テスト可能にします。
  2. **関心ごとの UI サブコンポーネント化**: 音声入力（`BlitzSpeechBox`）、模範解答・判定（`BlitzAnswerPanel`）、AI自動評価結果（`BlitzEvaluationPanel`）、スクリプト表示（`ShadowingScriptViewer`）のように、特定の表示・操作に集中したコンポーネントへ分割します。
  3. **親コンポーネントのオーケストレーター化**: 最上位のコンポーネントは状態の配線と子コンポーネントの合成に専念させ、肥大化を防ぎます。

---

## 6. スタイリング規約 (CSS)

### 6.1. モジュラー CSS アーキテクチャ
- 単一の巨大な CSS ファイルへの集約を廃止し、**`src/styles/`** 配下に責務別のモジュールとして分割管理します：
  1. **`tokens.css`**: カラーパレット、フォント、余白、角丸、シャドウなどの CSS 変数（Design Tokens）。
  2. **`base.css`**: ボックスサイジング、リセット、ルートレイアウト、共通キーフレームアニメーション、ユーティリティクラス。
  3. **`components.css`**: アプリケーション共通のヘッダー、ナビゲーション、ボタン（`.btn`）、モーダル、入力フィールド。
  4. **`features/*.css`**: 各機能ドメイン固有のスタイル（`conversation.css`, `blitz.css`, `shadowing.css`, `coach.css`）。
  5. **`responsive.css`**: モバイル固定ボトムナビゲーション、ブレークポイント（`768px`, `640px`, `480px`）のメディアクエリ。
- **`src/index.css`** は上記モジュールを `@import` で取り込むエントリポイントとしてのみ機能させます。

### 6.2. CSS クラスの命名規則
- クラス名は小文字ハイフン区切り（**`kebab-case`**）とし、意味を持った構造的な命名を採用します。
  - Block: `.chat-room`, `.blitz-card`, `.floating-coach-panel`
  - Element: `.chat-header`, `.timer-bar-fill`, `.phrase-text-col`
  - Modifier: `.btn-primary`, `.is-active`, `.badge-perfect`, `.status-needs_work`

### 6.3. インラインスタイルの制限
- レイアウトや静的装飾のスタイルは原則として CSS クラスに記述します。
- 動的に値が変わるもの（タイマーの進捗率 `width: ${progress}%`、位置計算など）に限り、`style={{ ... }}` のインラインスタイルを許容します。

### 6.4. レスポンシブ設計
- モバイルファーストおよび PC/モバイル双方での快適な操作性を重視します。
- スマートフォン表示時の主要ブレークポイント:
  - `@media (max-width: 768px)`: モバイル向け縦積みレイアウト、固定ボトムナビゲーション、タッチフレンドリーなボタンサイズ（最小 `44px x 44px`）。


---

## 7. AI (Google Gemini API) 実装規約

### 7.1. モデルの定数化
- 使用するモデル名はハードコードせず、`src/services/ai/client.ts` の `DEFAULT_MODEL` を参照します。
- 現在の標準モデル: `gemini-3.5-flash-lite`

### 7.2. 構造化出力 (Structured Outputs) の利用
- JSON 形式での応答が必要な処理（セッション診断、お題生成、ヒント生成等）では、Gemini API の `responseSchema` および `responseMimeType: 'application/json'` を指定します。

### 7.3. 出力サニタイズと JSON 修復
- LLM がマークダウン記法（` ```json ... ``` `）を混入させたり、出力トークン上限で JSON が途切れるケースに備え、パース前には必ず `cleanPhrase()` や `repairJson()` (`src/utils/jsonRepair.js`) を通します。

```typescript
// ✅ Good
import { repairJson } from '../../utils/jsonRepair';

const rawText = await callGeminiApi(apiKey, model, systemInstruction, contents, responseSchema);
const parsedData = repairJson(rawText);
```

### 7.4. セキュリティと機密情報管理
- **API キーのハードコード厳禁**: ソースコードやコミット履歴に実際の API Key を含めてはなりません。
- API キーはユーザー自身がブラウザの `LocalStorage` に保存するか、環境変数（`.env.local`）から読み込みます。

---

## 8. AWS CDK & Lambda 規約

### 8.1. Lambda ハンドラーの責務分離
- Lambda はステートレスに保ち、以下の構造で単一責任を徹底します：
  1. **CORS プリフライト (OPTIONS) の即時返却**
  2. **API Key / Origin ヘッダーの検証**
  3. **リクエストボディのバリデーション**
  4. **DynamoDB への読み書き処理**
  5. **エラーハンドリングと標準化されたレスポンス形式 (`statusCode`, `headers`, `body`)**

### 8.2. CDK の最小権限の原則 (Least Privilege)
- DynamoDB テーブルへのアクセス権限は、Lambda ごとに必要な操作のみを付与します（例: 読み取り専用関数には `table.grantReadData(handler)` のみ付与）。
- 生成データ（ニュースシナリオ等）には **TTL (Time To Live)** を設定し、自動クリーンアップされるようにします。

---

## 9. テスト & 品質管理規約 (Testing & Quality Assurance)

### 9.1. テストフレームワーク (Vitest)
- フロントエンドおよび Lambda 関数の単体テストには **Vitest** を使用します。
- モック化が必要な外部通信（`fetch`、DynamoDB クライアント、Gemini API）は、各テストの前に `vi.restoreAllMocks()` で初期化します。

```typescript
// ✅ Good: テストの構造例
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSituations } from '../api';

describe('fetchSituations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback data when API endpoint is unavailable', async () => {
    const result = await fetchSituations();
    expect(result.isFallback).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });
});
```

### 9.2. リント規約 (`oxlint`)
- 高速な静的解析ツール **oxlint** を採用しています。
- `.oxlintrc.json` にて React のフックルール（`react/rules-of-hooks`）等が有効化されています。
- CI およびローカルにおいて、**リントエラー（Error / Warning）はゼロ**を維持します。

### 9.3. 型検査規約 (`tsc --noEmit`)
- フロントエンド全体の厳格な型チェックを実施するため、`package.json` に `"typecheck": "tsc --noEmit"` を整備しています。
- 型定義の矛盾や未定義プロパティの参照による実行時例外を完全に防ぐため、型エラーは常に 0 件を維持します。

### 9.4. 開発・コミット前チェックフロー
コミットやプルリクエスト作成前に、以下のローカルコマンドがすべて正常にパス（エラー・警告 0）することを確認してください：

```bash
# 1. 高速静的解析 (Oxlint)
npm run lint

# 2. TypeScript 型検査 (tsc)
npm run typecheck

# 3. フロントエンド全単体テストの実行 (Vitest)
npm test

# 4. プロダクションビルドの検証 (Vite)
npm run build

# 5. (CDK/Lambda 変更時) バックエンドテストの実行
cd cdk && npm test && cd ..
```

### 9.5. CI/CD 品質ゲート (GitHub Actions)
`.github/workflows/deploy.yml` において、`main` ブランチへのプッシュ時に以下の 4 段階ゲートが自動実行されます：
1. **Lint Check**: `npm run lint`
2. **Type Check**: `npm run typecheck`
3. **Unit Tests**: `npm test`
4. **Production Build**: `npm run build`
いずれか 1 つでも失敗した場合はデプロイが自動中断され、本番環境の品質が保証されます。


---

*制定日: 2026-09-19*  
*対象リポジトリ: SpeakFlow (sabamiso-lab/ai-conversation-coach)*
