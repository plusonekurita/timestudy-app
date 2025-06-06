from fastapi import FastAPI
from app.routers import auth, time_records
from app.db.database import Base, engine

app = FastAPI()

# DBモデルのテーブル作成（初回のみ）
print("🔧 create_all 実行開始")
Base.metadata.create_all(bind=engine)

# ✅ APIエンドポイントを /api/* に統一
app.include_router(auth.router, prefix="/api")
app.include_router(time_records.router, prefix="/api")
