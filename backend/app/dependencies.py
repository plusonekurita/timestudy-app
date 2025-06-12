# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
import os
from app.models.user import User
from app.db.database import get_db

# SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
SECRET_KEY = "changeme"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    print("受信トークン:", token)  # 追加
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print("デコード結果:", payload)  # 追加

        uid = payload.get("sub")
        if uid is None:
            print("UIDがトークンにありません")
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.uid == uid).first()
        if user is None:
            print("ユーザーがDBに存在しません:", uid)
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except jwt.PyJWTError as e:
        print("トークンデコードエラー:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="管理者権限が必要です")
    return current_user
