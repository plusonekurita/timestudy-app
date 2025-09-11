# app/main.py
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from passlib.hash import bcrypt

from app.db.database import Base, engine, SessionLocal
from app.routers import time_records, admin, ws, staffs, auth
from app.models.user import User
from app.seeds.seed_data import create_initial_users_and_offices


def create_admin_user():
    """存在しない場合のみ管理者/テストユーザーを作成"""
    db: Session = SessionLocal()
    try:
        if not db.query(User).filter(User.uid == "admin").first():
            db.add(
                User(
                    uid="admin",
                    name="管理者",
                    password=bcrypt.hash("1964101001"),
                    version=1,
                    role="admin",
                )
            )
            print("👑 管理者ユーザーを作成しました")

        if not db.query(User).filter(User.uid == "plusone").first():
            db.add(
                User(
                    uid="plusone",
                    name="プラスワン",
                    password=bcrypt.hash("1964101001"),
                    version=1,
                    role="user",
                )
            )
            print("✅ テストユーザーを作成しました")

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """起動時（yield前）と終了時（yield後）の処理を管理"""
    # --- startup 相当：DB の準備をリトライ付きで実施 ---
    delay = 2
    max_tries = 6  # 2,4,8,16,32,64秒 ≒ 最大 ~2分待つ
    for i in range(max_tries):
        try:
            # 接続/DDL はトランザクション内で
            with engine.begin() as conn:
                # Alembic を使う場合は次行は不要
                Base.metadata.create_all(bind=conn)
            break
        except OperationalError as e:
            if i == max_tries - 1:
                # ここで raise すれば Render のログに原因が残る
                raise
            print(f"⏳ DB not ready (trial {i+1}/{max_tries}) -> retry in {delay}s: {e.__class__.__name__}")
            await asyncio.sleep(delay)
            delay *= 2

    # シードは存在チェック付きなので多重でも安全
    create_admin_user()
    create_initial_users_and_offices()

    # アプリ稼働開始
    yield

    # --- shutdown 相当 ---
    print("🛑 Application shutting down")


app = FastAPI(lifespan=lifespan)

# CORS 設定：認証Cookie等を使わない前提の安全側デフォルト
# 認証を使う場合は allow_credentials=True にして allow_origins を具体的なドメイン配列に変更してください。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(time_records.router, prefix="/api")
app.include_router(ws.router)  # WebSocket は prefix そのまま
app.include_router(staffs.router, prefix="/api")


@app.get("/healthz")
def healthz():
    return {"ok": True}
