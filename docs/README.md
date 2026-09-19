# 📚 SpeakFlow ドキュメントポータル (Documentation Index)

SpeakFlow の各種仕様書、技術アーキテクチャ、コーディング規約への総合インデックスです。  
目的に応じて以下のドキュメントをご参照ください。

---

## 📑 ドキュメント一覧

| ドキュメント | 主な対象読者 | 内容・目的 |
| :--- | :--- | :--- |
| 📖 **[機能仕様・学習機能ガイド (FEATURES.md)](./FEATURES.md)** | 学習者 / ユーザー / プロダクト企画 | 各学習機能（AI英会話ロールプレイ、瞬間英作文、シャドーイング、常駐AIコーチ）の詳細仕様、学習フロー、画面機能の説明。 |
| 🏗️ **[技術アーキテクチャ・仕様 (ARCHITECTURE.md)](./ARCHITECTURE.md)** | エンジニア / アーキテクト | 全体システム構成、フロントエンド設計、Gemini API 連携、AWS CDK インフラ、CI/CD パイプラインの詳細技術解説。 |
| 📐 **[コーディング規約 (CODING_STANDARDS.md)](./CODING_STANDARDS.md)** | コントリビューター / 開発者 | 設計原則、TypeScript/React 規約、モジュラー CSS 規約、命名規則、テスト・品質基準の統一ルール。 |
| ☁️ **[AWS CDK バックエンド (cdk/README.md)](../cdk/README.md)** | インフラ・バックエンド開発者 | DynamoDB, Lambda, API Gateway のインフラ構成、ローカル実行、デプロイコマンド手順。 |

---

## 🧭 ドキュメントの選び方

- **「アプリの機能や学習方法、画面の詳しい使い方を知りたい」**  
  👉 [機能仕様・学習機能ガイド (FEATURES.md)](./FEATURES.md)
- **「全体のシステム設計、AI のプロンプトや JSON 修復、AWS 構成を知りたい」**  
  👉 [技術アーキテクチャ・仕様 (ARCHITECTURE.md)](./ARCHITECTURE.md)
- **「コードを追加・変更したい、PR を作成したい、命名規則を知りたい」**  
  👉 [コーディング規約 (CODING_STANDARDS.md)](./CODING_STANDARDS.md)
- **「バックエンドの API や DynamoDB を AWS 上にデプロイしたい」**  
  👉 [AWS CDK バックエンド (cdk/README.md)](../cdk/README.md)
