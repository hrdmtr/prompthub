# Renderへのデプロイ手順

このドキュメントでは、PromptHubをRenderにデプロイする手順を説明します。

## 準備

1. Renderアカウントを作成 (https://render.com)
2. GitHubリポジトリにコードをプッシュ
3. MongoDB Atlas (https://www.mongodb.com/cloud/atlas) でデータベースを作成

## デプロイ手順

### 1. Renderにサインイン

Renderダッシュボードにログインします。

### 2. 「New」ボタンをクリック

「Blueprint」を選択し、GitHubリポジトリに接続します。

### 3. リポジトリの選択

PromptHubのリポジトリを選択します。

### 💡 Docker vs ビルドパック

このプロジェクトではDockerfileを使用したデプロイもサポートしています。render.yamlは`env: docker`を使用してDockerfileでのデプロイを指定していますが、以下のように変更することでビルドパック方式にすることも可能です：

```yaml
services:
  - type: web
    name: prompthub-api
    env: node  # dockerからnodeに変更
    buildCommand: npm install
    startCommand: npm start
    # dockerfilePathは削除
```

Dockerfileを使用する主なメリット：
- 環境の一貫性が高まる
- ローカル開発とデプロイ環境の差異が減る
- カスタマイズの自由度が高い

### 4. 環境変数の設定

`prompthub-api` サービスに以下の環境変数を設定します：

- `MONGODB_URI`: MongoDB Atlasの接続文字列
- `JWT_SECRET`: JWTトークンの署名に使用する秘密鍵（安全な長い文字列）
- `NODE_ENV`: `production`に設定

### 5. デプロイの開始

「Create Blueprint」ボタンをクリックしてデプロイを開始します。

## MongoDBの設定

1. MongoDB Atlasで新しいクラスターを作成
2. データベースユーザーを作成（ユーザー名とパスワードを記録）
3. IPアクセスリストを設定（`0.0.0.0/0`で任意の場所からアクセス可能に）
4. 接続文字列を取得し、Renderの環境変数`MONGODB_URI`に設定

接続文字列の例：
```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/prompthub?retryWrites=true&w=majority
```

## ウェブサービスについて

- **バックエンド**: `prompthub-api` - ExpressサーバーAPI
- **フロントエンド**: `prompthub-web` - Reactフロントエンド

## 注意点

- デプロイ後に最初のリクエストが遅い場合があります（無料プランの場合、サービスがスリープすることがあるため）
- MongoDB Atlasの無料プラン（M0）で十分ですが、データ量が増えた場合はアップグレードが必要になる場合があります
- render.yamlファイルによって自動的にデプロイが設定されます