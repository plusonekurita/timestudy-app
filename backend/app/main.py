from fastapi import FastAPI
from app.routers import auth, time_records
from app.db.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://timestudy-app-frontend.onrender.com",  # ← フロントのURLを許可
    ],
    allow_credentials=True,
    allow_methods=["*"],  # POST, GETなどすべて許可
    allow_headers=["*"],  # Authorization なども含む
)

# DBモデルのテーブル作成（初回のみ）
Base.metadata.create_all(bind=engine)

# ✅ APIエンドポイントを /api/* に統一
app.include_router(auth.router, prefix="/api")
app.include_router(time_records.router, prefix="/api")
