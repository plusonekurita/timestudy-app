from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.staffs import Staffs
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# レスポンススキーマ（必要な項目のみ）
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
    print("職員取得")
    try:
        staffs = db.query(Staffs).filter(Staffs.office_id == office_id).all()

        if not staffs:
            raise HTTPException(status_code=404, detail="該当するスタッフが見つかりませんでした。")

        return staffs

    except Exception as e:
        print("❌ スタッフ取得エラー:", str(e))
        raise HTTPException(status_code=500, detail="スタッフ取得中にエラーが発生しました")
