# 仕様技術・構成

## フロントエンド

- 言語: JavaScript
- フレームワーク: React 19（+ Vite）
- UI: MUI（Material UI）
- 状態管理: Redux Toolkit / Redux Persist（永続化）
- ルーティング: React Router
- その他: PWA 対応

## バックエンド

- 言語: Python 3.11
- フレームワーク: FastAPI
- サーバー: Uvicorn（開発環境） / Gunicorn + UvicornWorker（本番環境）

## データベース

- PostgreSQL 15

## インフラ・開発環境

- コンテナ管理: Docker / Docker Compose
- リバースプロキシ: Nginx
- 本番ビルド: multi-stage Dockerfile
- 環境変数管理: `.env` ファイルベース

# 必要ツール

## 1. Docker.Desktop のインストール

- 下記の URL からダウンロード＆インストール（※要注意：再起動されます）
- https://docs.docker.com/desktop/setup/install/windows-install/

# 開発環境構築（ローカル）

## 1. .env ファイルの作成

- 下記のコマンドを実行して.env ファイルを作成後、編集

- cp .env.example .env

## 2. 開発用 Docker 環境を起動

- docker compose -f docker-compose.dev.yml up --build

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:8000/docs
- PostgreSQL: localhost:5433（DB 名：demo）

# 本番環境構築

## 1. .env ファイルの作成

- 下記のコマンドを実行して.env ファイルを作成後、編集

- cp .env.example .env

## 2. 本番用 Docker 環境を起動

- docker compose -p timestudy-prod up -d --build

- フロントエンド: http://<サーバー IP>/
- バックエンド API: http://<サーバー IP>:8000/docs

# 本番環境の再ビルド（変更反映時）

- docker compose -f docker-compose.yml build
- docker compose -f docker-compose.yml up -d

# Docker コマンド（開発環境）

- docker compose -f docker-compose.dev.yml down # 開発環境を停止
- docker compose -f docker-compose.dev.yml up -d --build # 開発環境を起動
- docker compose -f docker-compose.dev.yml ps # コンテナの状態確認
- docker compose -f docker-compose.dev.yml logs -f # コンテナのログ確認

# Docker コマンド（本番環境）

- docker compose -p timestudy-prod up -d --build 　# 本番環境を起動
- docker compose -p timestudy-prod down # 本番環境を停止

# 開発環境ライブラリ追加手順(バックエンド)

## 1. コンテナに入る

- docker compose exec backend bash

## 2. ライブラリのインストール

- pip install ライブラリ名

## 3. 依存を反映

- pip freeze > requirements.txt

## 4. 再ビルド

- docker compose up --build

## 5. ライブラリを削除する場合

- requirements.txt から不要なライブラリの行を削除
- Docker を再ビルド

- docker compose build backend

### または

- docker compose up --build

# 開発環境ライブラリ追加手順（フロントエンド）

## 1. フロントエンド直下で以下を実行

- cd frontend
- npm install ライブラリ名

※ 本番反映には Git にコミットした後に Docker ビルドが必要です

# ファイアウォール設定（スマホから接続できない場合）

## ESET が入ってる場合

- 設定 → ネットワーク保護 → ファイアウォール（設定）
- 別ウィンドウが表示されるので、ルール（編集）→ 追加
- ルールの追加で以下の項目にセットし OK

名前 :分かりやすい名前
アクション :許可
方向 :内向き（受信）
プロトコル :TCP
ローカルポート :80(本番環境) / 5173(開発環境)
リモートホスト :`192.168.0.0/16`（同じ LAN 内だけ許可）

- ※ 設定変更後、スマホから `http://<PCのIPアドレス>` にアクセスし、アプリが表示されるか確認。

## 他の方法等あれば追記
