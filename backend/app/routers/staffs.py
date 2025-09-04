from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from passlib.context import CryptContext

from app.db.database import get_db
from app.models.staffs import Staffs

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# スタッフ作成
class StaffCreate(BaseModel):
    name: str = Field(..., min_length=1)
    staff_code: str = Field(..., min_length=1)
    login_id: str = Field(..., min_length=3)          # 必須
    password: str = Field(..., min_length=6)          # 必須（ハッシュ化保存）
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    job: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False

# スタッフ取得（全スタッフ）
class StaffResponse(BaseModel):
    id: int
    name: str
    staff_code: Optional[str]
    is_active: bool
    is_admin: bool
    job: Optional[str]

    model_config = {
        "from_attributes": True
    }


@router.get("/offices/{office_id}/staffs", response_model=List[StaffResponse])
def get_staffs_by_office(office_id: int, db: Session = Depends(get_db)):
    try:
        staffs = db.query(Staffs).filter(Staffs.office_id == office_id).all()

        if not staffs:
            raise HTTPException(status_code=404, detail="該当するスタッフが見つかりませんでした。")

        return staffs

    except Exception as e:
        print("❌ スタッフ取得エラー:", str(e))
        raise HTTPException(status_code=500, detail="スタッフ取得中にエラーが発生しました")


# スタッフ追加
@router.post(
    "/offices/{office_id}/staffs",
    response_model=StaffResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_staff(office_id: int, payload: StaffCreate, db: Session = Depends(get_db)):
    try:
        # 職員コード重複チェック
        exists_code = (
            db.query(Staffs)
            .filter(Staffs.office_id == office_id, Staffs.staff_code == payload.staff_code)
            .first()
        )
        if exists_code:
            raise HTTPException(status_code=409, detail="この職員コードは既に使用されています。")

        # login_id 重複チェック（システム全体）
        exists_login = db.query(Staffs).filter(Staffs.login_id == payload.login_id).first()
        if exists_login:
            raise HTTPException(status_code=409, detail="このログインIDは既に使用されています。")

        # パスワードをハッシュ化
        hashed_password = pwd_context.hash(payload.password)

        staff = Staffs(
            office_id=office_id,
            name=payload.name,
            staff_code=payload.staff_code,
            login_id=payload.login_id,
            password=hashed_password,
            email=payload.email,
            phone_number=payload.phone_number,
            job=payload.job,
            is_active=payload.is_active,
            is_admin=payload.is_admin,
        )
        db.add(staff)
        db.commit()
        db.refresh(staff)

        return staff

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print("❌ スタッフ追加エラー:", str(e))
        raise HTTPException(status_code=500, detail="スタッフ登録中にエラーが発生しました")
