# PromptHub

PromptHubは、AIプロンプトを共有、発見、改善するためのコミュニティプラットフォームです。高品質なプロンプトを共有し、他のユーザーからフィードバックを得ることで、AIとの対話をより効果的かつ創造的にします。

![PromptHub Platform](https://github.com/yourusername/prompthub/raw/main/client/public/screenshot.png)

## 🌟 プロジェクトの意義とモチベーション

### なぜPromptHubを作ったのか？

AIの進化に伴い、効果的なプロンプト（指示）の重要性が高まっています。しかし、優れたプロンプトの作成には経験と知識が必要です。PromptHubは、この課題を解決するため、以下の目的で開発されました：

- **知識の民主化**: プロンプトエンジニアリングの知識を広く共有し、誰もが効果的なAIの活用法を学べる場を提供
- **コミュニティの構築**: AIプロンプトに興味を持つ人々が集い、互いに学び合う場の創出
- **イノベーションの促進**: 様々な分野や用途に特化したプロンプトを通じて、AI活用の可能性を広げる

### プロンプト共有の重要性

優れたプロンプトは単なる質問ではなく、AIの能力を最大限に引き出すための「レシピ」です。PromptHubでは：

- 専門家が使用する効果的なプロンプトパターンを学べる
- 特定の目的に最適化されたプロンプトをすぐに利用できる
- フィードバックを通じてプロンプトを継続的に改善できる

## 💡 主な機能

### 利用者ができること

- **プロンプトの発見**: カテゴリ、目的、人気度などでプロンプトを検索・閲覧
- **プロンプトの共有**: 自分が作成した効果的なプロンプトを公開
- **フィードバック**: いいね、コメント、使用回数を通じたフィードバック
- **プロンプトの保存**: 後で使用するためにお気に入りのプロンプトを保存
- **改善の提案**: コメントを通じてプロンプトの改善案を提案

### 対応するAIサービス

PromptHubで共有されるプロンプトは、以下のようなさまざまなAIサービスで利用できます：

- OpenAI (ChatGPT, GPT-4)
- Anthropic Claude
- Google Gemini
- その他のテキスト生成AI
- 画像生成AI（Stable Diffusion, DALL-E, Midjourney）

## 🚀 使い方

### プロンプトを見つける

1. **探索ページ**でプロンプトを閲覧
2. **カテゴリ**や**用途**でフィルタリング
3. **検索機能**で特定のキーワードを含むプロンプトを検索
4. **ソート機能**で人気順、新着順などでプロンプトを並べ替え

### プロンプトを共有する

1. **プロンプト作成ページ**でタイトル、内容、カテゴリ、用途、タグを入力
2. **投稿**して他のユーザーと共有
3. **フィードバック**を受け取り、必要に応じて**改善**

### プロンプトを使用する

1. 使用したいプロンプトの**詳細ページ**を開く
2. **コピー**ボタンでプロンプトをクリップボードにコピー
3. お好みのAIサービスで**ペースト**して使用
4. 効果的だった場合は**いいね**や**コメント**でフィードバックを提供

## 💻 開発者向け情報

### 技術スタック

- **フロントエンド**: React, TailwindCSS
- **バックエンド**: Node.js, Express
- **データベース**: MongoDB
- **認証**: JWT
- **デプロイ**: Docker, Render
- **コード品質**: ESLint, Prettier

### ローカル環境での実行方法

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/prompthub.git
cd prompthub

# .envファイルの作成
cp .env.example .env
# .envファイルを編集して必要な環境変数を設定

# 依存関係のインストール
npm install
cd client && npm install

# 開発サーバーの起動
npm run dev
```

### リンターとフォーマッターの使用方法

コード品質を維持するため、ESLintとPrettierを導入しています。以下のコマンドで使用できます：

#### サーバー側（ルートディレクトリ）

```bash
# コードのリント（構文チェック）
npm run lint

# リント問題の自動修正
npm run lint:fix

# コードの自動フォーマット
npm run format
```

#### クライアント側（clientディレクトリ）

```bash
# clientディレクトリに移動
cd client

# コードのリント（構文チェック）
npm run lint

# リント問題の自動修正
npm run lint:fix

# コードの自動フォーマット
npm run format
```

#### 一括実行（プロジェクト全体）

```bash
# プロジェクト全体のリント
npm run lint:all

# プロジェクト全体のフォーマット
npm run format:all
```

### Dockerを使った実行

```bash
# Dockerイメージのビルドと実行
docker build -t prompthub .
docker run -p 8080:8080 --env-file .env prompthub
```

### Renderへのデプロイ

1. Renderアカウントを作成し、GitHubリポジトリと連携
2. `render.yaml`を使用した構成をセットアップ:
   - Renderダッシュボードで新規「Blueprint」を作成
   - リポジトリとブランチを選択
3. 環境変数の設定:
   - `MONGODB_URI`: MongoDB接続文字列（MongoDB AtlasなどのクラウドサービスのURLを使用）
   - `JWT_SECRET`: JWTトークン用の秘密鍵

**注意**: Renderデプロイには Node.js ビルドパックを使用しています。Dockerfileはローカル開発とテスト用です。

### MongoDB Atlasの設定

MongoDB Atlasを使用する場合は、次の手順でRenderからの接続を許可する必要があります：

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にログイン
2. 使用するプロジェクトを選択
3. 左サイドメニューから「Network Access」をクリック
4. 「+ ADD IP ADDRESS」ボタンをクリック
5. 以下のいずれかを設定:
   - Renderのアウトバウンド固定IPを入力（Renderの管理画面で確認）
   - 開発中は `0.0.0.0/0` （任意のIP）を許可（**注**: 本番環境ではセキュリティのため範囲を制限することを推奨）
6. 「Confirm」をクリックして保存

接続文字列は以下の形式になります：
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

詳細は[CLAUDE.md](CLAUDE.md)を参照してください。

## 🤝 貢献

PromptHubはオープンソースプロジェクトです。バグ報告、機能提案、プルリクエストなど、あらゆる形での貢献を歓迎します。

## 📝 ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 📧 連絡先

質問や提案がある場合は、[Issues](https://github.com/yourusername/prompthub/issues)でお問い合わせください。

---

**PromptHub** - AIプロンプトの共有と発見のためのコミュニティ