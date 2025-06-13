# app/routers/admin.py
from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.time_record import TimeRecord
from app.dependencies import get_current_admin_user
from app.utils.exceptions import ApiException
from passlib.hash import bcrypt
from pydantic import BaseModel, Field, constr
from typing import Annotated
from datetime import datetime, timedelta, timezone
from app.websocket_manager import manager

JST = timezone(timedelta(hours=9))

# 管理者ページで使用するAPI集です
router = APIRouter()

UidStr = Annotated[str, constr(strip_whitespace=True, max_length=40, pattern="^[a-zA-Z0-9]+$")]
NameStr = Annotated[str, constr(strip_whitespace=True, max_length=40)]
PasswordStr = Annotated[str, constr(strip_whitespace=True, max_length=40, pattern="^[a-zA-Z0-9]+$")]

class CreateUserRequest(BaseModel):
    uid: UidStr
    name: NameStr
    password: PasswordStr
    role: str
    version: int = Field(..., ge=0, le=1)

@router.post("/admin/users/create")
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    if db.query(User).filter(User.uid == request.uid).first():
        raise ApiException(400, "ユーザー作成エラー", "そのUIDは既に存在します")

    user = User(
        uid=request.uid,
        name=request.name,
        password=bcrypt.hash(request.password),
        role="user",
        version=request.version
    )
    db.add(user)
    db.commit()

    return {"message": "ユーザーを作成しました"}

# ユーザー一覧取得
@router.get("/admin/users")
def list_users(db: Session = Depends(get_db), current_admin=Depends(get_current_admin_user)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "uid": u.uid,
            "name": u.name,
            "password": u.password,
            "version": u.version
        } for u in users
    ]

# 更新リクエスト用モデル
class UserUpdateRequest(BaseModel):
    uid: str
    name: str
    password: str = ""
    version: int

# ユーザー更新
@router.put("/admin/users/{user_id}")
def update_user(user_id: int, req: UserUpdateRequest, db: Session = Depends(get_db), current_admin=Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ApiException(404, "ユーザー検索エラー", "ユーザーが見つかりません")

    user.uid = req.uid
    user.name = req.name
    user.version = req.version

    if req.password.strip():  # パスワードが空でなければ更新
        user.password = bcrypt.hash(req.password)

    db.commit()

    return {"message": "ユーザー情報を更新しました"}

# ユーザー削除
@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin=Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ApiException(404, "ユーザー検索エラー", "ユーザーが見つかりません")

    db.delete(user)
    db.commit()
    return {"message": "ユーザーを削除しました"}


# ダッシュボード画面情報取得
@router.get("/admin/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_admin=Depends(get_current_admin_user)):
    user_count = db.query(func.count(User.id)).scalar()
    total_records = db.query(func.count(TimeRecord.id)).scalar()

    recent_users = (
        db.query(User)
        .filter(User.last_login != None)
        .order_by(desc(User.last_login))
        .limit(15)
        .all()
    )

    recent_data = [
        {
            "uid": u.uid,
            "name": u.name,
            "last_login": u.last_login.astimezone(JST).isoformat() if u.last_login else None
        }
        for u in recent_users
    ]

    return {
        "userCount": user_count,
        "totalRecords": total_records,
        "recentUsers": recent_data
    }

# ユーザの接続状況を取得（ソケット）
@router.get("/admin/active-users")
def get_active_users(db: Session = Depends(get_db)):
    all_users = db.query(User).order_by(User.id.asc()).all() # id順でユーザテーブルから取得
    connected_uids = set(manager.active_connections.keys())

    result = []
    for user in all_users:
        result.append({
            "id": user.id,
            "uid": user.uid,
            "name": user.name,
            "is_connected": user.uid in connected_uids
        })

    return {"connections": result}

@router.post("/admin/force-logout/{uid}")
async def force_logout(uid: str):
    await manager.force_logout_all(uid)
    return {"message": f"{uid} を切断しました"}