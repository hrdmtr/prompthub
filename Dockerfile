FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./
# バックエンド依存関係をインストール
RUN npm install

# クライアント依存関係をインストール
COPY client/package*.json ./client/
RUN cd client && npm install

# ソースコードをコピー
COPY . .

# フロントエンドをビルド
WORKDIR /app/client
RUN npm run build
WORKDIR /app

# 環境変数を設定
ENV NODE_ENV=production
ENV PORT=8080

# ポートを公開
EXPOSE 8080

# アプリを起動
CMD ["npm", "start"]