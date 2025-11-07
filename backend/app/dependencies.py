# app/dependencies.py
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
import os
from app.db.database import get_db
from app.models.staffs import Staffs

# SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
SECRET_KEY = "changeme"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # JWTトークンをデコード（有効期限も自動的にチェックされる）
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        uid = payload.get("sub")
        if uid is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Staffsモデルからユーザーを取得
        user = db.query(Staffs).filter(Staffs.login_id == uid, Staffs.is_active == True).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except jwt.ExpiredSignatureError:
        # トークンの有効期限が切れている
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError as e:
        # その他のJWTエラー
        raise HTTPException(status_code=401, detail="Invalid token")

