from fastapi import APIRouter, Depends, HTTPException, Request
from ipaddress import ip_address, ip_network
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
        # 管理者アカウント（admin）は一般ユーザーログインでは認証しない
        #if request.uid == "admin":
            #raise ApiException(401, "認証エラー", "ログインIDまたはパスワードが無効です")
        
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
            "role": "office",
            "version": 1
        }

    except HTTPException as http_err:
        raise http_err
    except Exception:
        raise ApiException(500, "内部エラー", "サーバー内部で問題が発生しました")


# 管理者専用ログイン（IP制限）
ALLOWED_ADMIN_IP = "120.51.157.8"
# 追加で許可するネットワーク（開発環境用：ローカル/プライベート）
ALLOWED_ADMIN_NETWORKS = [
    ip_network("127.0.0.1/32"),  # localhost (IPv4)
    ip_network("::1/128"),       # localhost (IPv6)
    ip_network("10.0.0.0/8"),
    ip_network("172.16.0.0/12"),
    ip_network("192.168.0.0/16"),
]

def _is_ip_allowed(ip: str) -> bool:
    try:
        addr = ip_address(ip)
    except Exception:
        return False
    if ip == ALLOWED_ADMIN_IP:
        return True
    for net in ALLOWED_ADMIN_NETWORKS:
        if addr in net:
            return True
    return False

class AdminLoginRequest(BaseModel):
    uid: str
    password: str

@router.post("/admin/login")
async def admin_login(payload: AdminLoginRequest, request: Request):
    try:
        # IPの判定（X-Forwarded-For 優先 → request.client）
        forwarded = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
        client_ip = (forwarded.split(",")[0].strip() if forwarded else None) or (request.client.host if request.client else None)

        if not client_ip or not _is_ip_allowed(client_ip):
            # 許可されていない場合は一般の認証エラー（情報秘匿）
            raise ApiException(401, "認証エラー", "ログインIDまたはパスワードが無効です")

        # 固定の管理者資格情報（必要ならDBに移行）
        if payload.uid != "admin" or payload.password != "1964101001":
            raise ApiException(401, "認証エラー", "ログインIDまたはパスワードが無効です")

        token = jwt.encode({"sub": "admin", "role": "admin"}, SECRET_KEY, algorithm="HS256")

        return {
            "access_token": token,
            "id": 0,
            "uid": "admin",
            "officeId": None,
            "office": None,
            "name": "管理者",
            "staffCode": None,
            "isAdmin": True,
            "job": "admin",
            "role": "admin",
            "version": 1,
        }
    except HTTPException as http_err:
        raise http_err
    except Exception:
        raise ApiException(500, "内部エラー", "サーバー内部で問題が発生しました")

