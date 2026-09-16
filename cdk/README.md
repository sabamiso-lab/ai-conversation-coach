# 🚀 SpeakFlow AWS CDK Backend

SpeakFlow のバックエンドインフラ（DynamoDB, AWS Lambda, API Gateway）を定義した AWS CDK プロジェクトです。

---

## 🛠️ 含まれるリソース

1. **DynamoDB テーブル (`SpeakFlowSituations`)**
   - シチュエーション（ロールプレイシナリオ）情報を保持。デプロイ時に初期6シナリオが自動投入されます。
2. **AWS Lambda (`SpeakFlowGetSituations`)**
   - DynamoDB からデータ取得。
   - **セキュリティ実装**:
     - ① CORS 制限 (`https://sabamiso-lab.github.io` / `localhost`)
     - ② Origin / Referer ヘッダーのドメイン検証
     - ③ `x-speakflow-api-key` カスタムヘッダーの照合
3. **API Gateway (HTTP API)**
   - エンドポイント `GET /situations` を公開。

---

## 📦 使い方・デプロイ手順

### 1. 依存パッケージのインストール
```bash
cd cdk
npm install
```

### 2. CDKの初期化 (初回のみ)
```bash
npx cdk bootstrap
```

### 3. デプロイ実行
```bash
npx cdk deploy
```

デプロイ完了後、ターミナルに以下のような Output が出力されます：
```text
Outputs:
SpeakFlowBackendStack.ApiEndpointUrl = https://xxxx.execute-api.ap-northeast-1.amazonaws.com/situations
SpeakFlowBackendStack.ApiKeyHeaderValue = sf_secret_key_speakflow_2026
SpeakFlowBackendStack.DynamoDBTableName = SpeakFlowSituations
```

---

## 🔑 フロントエンド (GitHub Pages) への設定方法

### ローカル開発の場合 (`.env.local`)
プロジェクトルート直下に `.env.local` を作成し、以下を設定します：
```env
VITE_API_BASE_URL=https://xxxx.execute-api.ap-northeast-1.amazonaws.com/situations
VITE_API_KEY=sf_secret_key_speakflow_2026
```

### GitHub Pages (GitHub Actions) の場合
GitHub リポジトリの **Settings > Secrets and variables > Actions** にて以下を追加してください：

- `VITE_API_BASE_URL`: CDKで出力された `ApiEndpointUrl` の値
- `VITE_API_KEY`: CDKで出力された `ApiKeyHeaderValue` の値
