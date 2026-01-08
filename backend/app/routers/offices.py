from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db.database import get_db
from app.models.offices import Offices
from app.models.staffs import Staffs


router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class OfficeResponse(BaseModel):
    id: int
    name: str
    jigyousyo_no: str | None = None
    postal_code: str | None = None
    address: str | None = None
    phone_number: str | None = None
    email: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/offices", response_model=List[OfficeResponse])
def list_offices(db: Session = Depends(get_db)):
    try:
        return db.query(Offices).all()
    except Exception as e:
        print("❌ Offices list error:", str(e))
        raise HTTPException(status_code=500, detail="事業所一覧の取得に失敗しました")


class OfficesCountResponse(BaseModel):
    count: int


@router.get("/offices/count", response_model=OfficesCountResponse)
def count_offices(db: Session = Depends(get_db)):
    try:
        total = db.query(Offices).count()
        return {"count": total}
    except Exception as e:
        print("❌ Offices count error:", str(e))
        raise HTTPException(status_code=500, detail="事業所数の取得に失敗しました")


class OfficeCreate(BaseModel):
    name: str
    jigyousyo_no: str | None = None
    postal_code: str | None = None
    address: str | None = None
    phone_number: str | None = None
    email: str | None = None
    is_active: bool = True


@router.post("/offices", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
def create_office(payload: OfficeCreate, db: Session = Depends(get_db)):
    try:
        office = Offices(
            name=payload.name,
            jigyousyo_no=payload.jigyousyo_no,
            postal_code=payload.postal_code,
            address=payload.address,
            phone_number=payload.phone_number,
            email=payload.email,
            is_active=payload.is_active,
        )
        db.add(office)
        db.commit()
        db.refresh(office)
        return office
    except Exception as e:
        db.rollback()
        print("❌ Office create error:", str(e))
        raise HTTPException(status_code=500, detail="事業所の登録に失敗しました")


class StaffCreateForOffice(BaseModel):
    name: str
    staff_code: Optional[str] = None
    login_id: str
    password: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    job: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False


class OfficeCreateWithStaff(BaseModel):
    # 事業所情報
    name: str
    jigyousyo_no: str | None = None
    postal_code: str | None = None
    address: str | None = None
    phone_number: str | None = None
    email: str | None = None
    is_active: bool = True
    # スタッフ情報（オプション）
    staff: Optional[StaffCreateForOffice] = None


class OfficeUpdate(BaseModel):
    name: str
    jigyousyo_no: str | None = None
    postal_code: str | None = None
    address: str | None = None
    phone_number: str | None = None
    email: str | None = None
    is_active: bool = True


@router.post("/offices/with-staff", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
def create_office_with_staff(payload: OfficeCreateWithStaff, db: Session = Depends(get_db)):
    """
    事業所とスタッフを同時に登録するエンドポイント（トランザクション処理）
    スタッフの登録に失敗した場合、事業所も登録されない
    """
    try:
        # 事業所を作成
        office = Offices(
            name=payload.name,
            jigyousyo_no=payload.jigyousyo_no,
            postal_code=payload.postal_code,
            address=payload.address,
            phone_number=payload.phone_number,
            email=payload.email,
            is_active=payload.is_active,
        )
        db.add(office)
        db.flush()  # IDを取得するためにflush（まだコミットしない）
        
        # スタッフが指定されている場合、スタッフも登録
        if payload.staff:
            staff_data = payload.staff
            
            # 職員コード重複チェック（入力がある場合のみ）
            if staff_data.staff_code:
                exists_code = (
                    db.query(Staffs)
                    .filter(Staffs.office_id == office.id, Staffs.staff_code == staff_data.staff_code)
                    .first()
                )
                if exists_code:
                    db.rollback()
                    raise HTTPException(status_code=409, detail="この職員コードは既に使用されています。")
            
            # login_id 重複チェック（システム全体）
            exists_login = db.query(Staffs).filter(Staffs.login_id == staff_data.login_id).first()
            if exists_login:
                db.rollback()
                raise HTTPException(status_code=409, detail="このログインIDは既に使用されています。")
            
            # パスワードをハッシュ化
            hashed_password = pwd_context.hash(staff_data.password)
            
            staff = Staffs(
                office_id=office.id,
                name=staff_data.name,
                staff_code=staff_data.staff_code,
                login_id=staff_data.login_id,
                password=hashed_password,
                email=staff_data.email,
                phone_number=staff_data.phone_number,
                job=staff_data.job,
                is_active=staff_data.is_active,
                is_admin=staff_data.is_admin,
            )
            db.add(staff)
        
        # すべて成功した場合のみコミット
        db.commit()
        db.refresh(office)
        return office
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print("❌ Office with staff create error:", str(e))
        raise HTTPException(status_code=500, detail="事業所とスタッフの登録に失敗しました")


@router.put("/offices/{office_id}", response_model=OfficeResponse)
def update_office(office_id: int, payload: OfficeUpdate, db: Session = Depends(get_db)):
    try:
        office = db.query(Offices).filter(Offices.id == office_id).first()
        if not office:
            raise HTTPException(status_code=404, detail="対象の事業所が見つかりません")
        office.name = payload.name
        office.jigyousyo_no = payload.jigyousyo_no
        office.postal_code = payload.postal_code
        office.address = payload.address
        office.phone_number = payload.phone_number
        office.email = payload.email
        office.is_active = payload.is_active
        db.commit()
        db.refresh(office)
        return office
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print("❌ Office update error:", str(e))
        raise HTTPException(status_code=500, detail="事業所の更新に失敗しました")


