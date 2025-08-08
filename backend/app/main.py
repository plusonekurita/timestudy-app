from fastapi import FastAPI
from app.routers import time_records, admin, ws, staffs, auth
from app.db.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from app.models.user import User

from app.seeds.seed_data import create_initial_users_and_offices
from app.db.database import SessionLocal
from app.models.offices import Offices
# from backend.app.routers import auth_old  # ←追加

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # POST, GETなどすべて許可
    allow_headers=["*"],  # Authorization なども含む
)

def create_admin_user():
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.uid == "admin").first()
        if not existing:
            admin = User(
                uid="admin",
                name="管理者",
                password=bcrypt.hash("1964101001"),
                version=1,
                role="admin"
            )
            db.add(admin)
            print("管理者ユーザーを作成しました")

        existing_test = db.query(User).filter(User.uid == "plusone").first()
        if not existing_test:
            test_user = User(
                uid="plusone",
                name="プラスワン",
                password=bcrypt.hash("1964101001"),
                version=1,
                role="user"  # または "staff" など必要な権限に応じて変更
            )
            db.add(test_user)
            print("✅ テストユーザーを作成しました")

        db.commit()
    finally:
        db.close()

# DBモデルのテーブル作成（初回のみ）※ポスグレにテーブルが構築される
Base.metadata.create_all(bind=engine)

# 管理者ユーザーの自動作成
create_admin_user()
create_initial_users_and_offices()

# ✅ APIエンドポイントを /api/* に統一
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(time_records.router, prefix="/api")
app.include_router(ws.router)
app.include_router(staffs.router, prefix="/api")
