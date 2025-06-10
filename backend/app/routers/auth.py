from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.hash import bcrypt
from app.models.user import User
from app.db.database import get_db
from datetime import datetime, timedelta, timezone
from app.utils.exceptions import ApiException
import jwt
import os
import uuid

JST = timezone(timedelta(hours=9))

router = APIRouter()
# SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
SECRET_KEY = "changeme"
print(SECRET_KEY)

class LoginRequest(BaseModel):
    uid: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.uid == request.uid).first()
    try:
        user = db.query(User).filter(User.uid == request.uid).first()

        if not user:
            raise ApiException(401, "認証エラー", "ユーザーが見つかりません")

        if not bcrypt.verify(request.password, user.password):
            raise ApiException(401, "認証エラー", "パスワードが一致しません")
        
        user.last_login = datetime.now(JST)
        db.commit()

        token = jwt.encode(
            {"sub": user.uid, "role": user.role},
            SECRET_KEY,
            algorithm="HS256"
        )
        return {
            "access_token": token,
            "id": user.id,
            "name": user.name,
            "version": user.version,
            "role": user.role
        }
    except HTTPException as http_err:
        raise http_err  # 上の認証エラーをそのまま返す

    except Exception as e:
        raise ApiException(500, "内部エラー", "サーバー内部で問題が発生しました")
