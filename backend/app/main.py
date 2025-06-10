from fastapi import FastAPI
from app.routers import auth, time_records, admin
from app.db.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from app.models.user import User
from app.db.database import SessionLocal

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
            db.commit()
            print("管理者ユーザーを作成しました")
    finally:
        db.close()

# DBモデルのテーブル作成（初回のみ）※ポスグレにテーブルが構築される
Base.metadata.create_all(bind=engine)

# 管理者ユーザーの自動作成
create_admin_user()

# ✅ APIエンドポイントを /api/* に統一
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(time_records.router, prefix="/api")
