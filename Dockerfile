# シンプルな1段階ビルドに変更
FROM node:18-alpine

# ワーキングディレクトリ設定
WORKDIR /app

# 依存関係ファイルのコピー
COPY package*.json ./
COPY client/package*.json ./client/

# バックエンド依存関係のインストール
RUN npm install

# クライアント依存関係のインストール
WORKDIR /app/client
RUN npm install
# 無限ループバグを避けるために.env.productionを安全な内容に置き換え
RUN echo "# API URL - Production build" > .env.production

# ワーキングディレクトリをルートに戻す
WORKDIR /app

# ソースコードのコピー
COPY . .

# フロントエンドのビルド
WORKDIR /app/client
RUN CI=false npm run build
RUN ls -la build
RUN mkdir -p /app/build
RUN cp -r build/* /app/build/

# ワーキングディレクトリをルートに戻す
WORKDIR /app

# ビルド結果の確認
RUN ls -la /app/client/build || echo "Client build directory missing!"
RUN ls -la /app/build || echo "Root build directory missing!"

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=10000
ENV HOST=0.0.0.0

# アプリを公開するポート
EXPOSE 10000

# サーバー起動コマンド
CMD ["node", "server.js"]