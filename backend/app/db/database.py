# app/db/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import urlparse

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:19641010+1@localhost:5433/time_prod")
print("📡 DATABASE_URL:", DATABASE_URL)

# パスワードは絶対に出さない。ホスト情報だけ軽くログ。
u = urlparse(DATABASE_URL)
print(f"📡 DB host: {u.hostname}, port: {u.port or 5432}, ssl={'sslmode=require' in (u.query or '')}")

# Render外部接続は基本SSL必須。プール健全性チェックも有効化。
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,   # 30分で再接続
    pool_size=5,
    max_overflow=10,
    connect_args={"sslmode": "require"},
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
