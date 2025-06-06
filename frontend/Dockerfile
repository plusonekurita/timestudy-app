# Node.jsの公式イメージをベースにする（軽量なAlpineを使用）
FROM node:22.15.0-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 必要な依存パッケージをインストール
RUN npm install

# ソースコード全体をコンテナにコピー
COPY . .

# 公開ポートはViteの5173を使用
EXPOSE 5173
