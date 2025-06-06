from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.hash import bcrypt
from app.models.user import User
from app.db.database import get_db
from datetime import datetime, timedelta
import jwt
import os
import uuid

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY", "changeme")

class LoginRequest(BaseModel):
    uid: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.uid == request.uid).first()
    try:
        user = db.query(User).filter(User.uid == request.uid).first()

        if not user:
            print("ユーザーが見つかりませんでした:", request.uid)
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not bcrypt.verify(request.password, user.password):
            print("パスワードが一致しません")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = jwt.encode({"sub": user.uid}, SECRET_KEY, algorithm="HS256")
        print("ログイン成功:", user.uid)
        return {
            "access_token": token,
            "id": user.id,
            "name": user.name,
            "version": user.version
        }

    except Exception as e:
        print("内部エラー:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
