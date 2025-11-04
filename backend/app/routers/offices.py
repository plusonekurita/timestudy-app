from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.offices import Offices


router = APIRouter()


class OfficeResponse(BaseModel):
    id: int
    name: str
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
    address: str | None = None
    phone_number: str | None = None
    email: str | None = None
    is_active: bool = True


@router.post("/offices", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
def create_office(payload: OfficeCreate, db: Session = Depends(get_db)):
    try:
        office = Offices(
            name=payload.name,
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


class OfficeUpdate(BaseModel):
    name: str
    address: str | None = None
    phone_number: str | None = None
    email: str | None = None
    is_active: bool = True


@router.put("/offices/{office_id}", response_model=OfficeResponse)
def update_office(office_id: int, payload: OfficeUpdate, db: Session = Depends(get_db)):
    try:
        office = db.query(Offices).filter(Offices.id == office_id).first()
        if not office:
            raise HTTPException(status_code=404, detail="対象の事業所が見つかりません")
        office.name = payload.name
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


