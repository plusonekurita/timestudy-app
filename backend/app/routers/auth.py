from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import jwt
from pydantic import BaseModel
from passlib.hash import bcrypt

from app.db.database import get_db
from app.models.staffs import Staffs
from app.utils.exceptions import ApiException

JST = timezone(timedelta(hours=9))

router = APIRouter()
# SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
SECRET_KEY = "changeme"

class LoginRequest(BaseModel):
    uid: str
    password: str

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        staff = db.query(Staffs).filter(Staffs.login_id == request.uid, Staffs.is_active == True).first()

        if not staff or not bcrypt.verify(request.password, staff.password):
            raise ApiException(401, "認証エラー", "ログインIDまたはパスワードが無効です")

        # 最終ログイン更新
        staff.update_at = datetime.now(JST)
        db.commit()

        token = jwt.encode(
            {"sub": staff.login_id, "role": "office"},
            SECRET_KEY,
            algorithm="HS256"
        )

        return {
            "access_token": token,
            "id": staff.id,
            "uid": staff.login_id,
            "officeId": staff.office_id,
            "office": staff.office,
            "name": staff.name,
            "staffCode": staff.staff_code,
            "isAdmin": staff.is_admin,
            "job": staff.job,
        }

    except HTTPException as http_err:
        raise http_err
    except Exception:
        raise ApiException(500, "内部エラー", "サーバー内部で問題が発生しました")
