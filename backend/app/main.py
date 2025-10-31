from fastapi import FastAPI
from app.routers import time_records, ws, staffs, auth
from app.db.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

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


# DBモデルのテーブル作成（初回のみ）※ポスグレにテーブルが構築される
Base.metadata.create_all(bind=engine)

# 初期データの作成
# create_initial_users_and_offices()

# ✅ APIエンドポイントを /api/* に統一
app.include_router(auth.router, prefix="/api")
app.include_router(time_records.router, prefix="/api")
app.include_router(ws.router)
app.include_router(staffs.router, prefix="/api")
