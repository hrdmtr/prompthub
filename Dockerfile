# マルチステージビルド - ビルドステージ
FROM node:18-alpine AS builder

# ワーキングディレクトリ設定
WORKDIR /app

# バックエンド依存関係のインストール
COPY package*.json ./
RUN npm install

# フロントエンド依存関係のインストール
COPY client/package*.json ./client/
RUN cd client && npm install

# ソースコードをコピー
COPY . .

# フロントエンドのビルド（CI=falseで警告をエラーとして扱わない）
RUN cd client && CI=false npm run build

# ビルド結果の確認
RUN ls -la client/build
RUN echo "Build completed"

# 実行ステージ - 最終的なイメージ
FROM node:18-alpine

# ワーキングディレクトリ設定
WORKDIR /app

# 本番用ライブラリのみインストール
COPY package*.json ./
RUN npm install --production

# バックエンドコードをコピー
COPY --from=builder /app/server.js ./
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/models ./models
COPY --from=builder /app/middleware ./middleware

# フロントエンドのビルド結果をコピー
COPY --from=builder /app/client/build ./client/build
# セカンダリビルドディレクトリにも配置（冗長化）
RUN mkdir -p ./build
COPY --from=builder /app/client/build ./build

# ビルドディレクトリの確認
RUN ls -la ./client/build
RUN ls -la ./build

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# アプリを公開するポート
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget -qO- http://localhost:$PORT/api/test || exit 1

# サーバー起動コマンド
CMD ["node", "server.js"]