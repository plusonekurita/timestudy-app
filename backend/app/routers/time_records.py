from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import List, Dict, Any
from app.db.database import get_db
from app.models.time_record import TimeRecord

router = APIRouter()

class RecordEntry(BaseModel):
    id: str
    type: str
    name: str
    label: str
    startTime: str
    endTime: str
    duration: int

class TimeRecordRequest(BaseModel):
    user_id: int
    record_date: date
    record: List[RecordEntry]

class TimeRecordRangeRequest(BaseModel):
    user_id: int
    start_date: date
    end_date: date

@router.post("/save-time-records")
def create_time_record(request: TimeRecordRequest, db: Session = Depends(get_db)):
    try:
        # 既に同じ user_id + record_date のレコードがあるか確認
        existing = db.query(TimeRecord).filter_by(
            user_id=request.user_id,
            record_date=request.record_date
        ).first()

        if existing:
            # 既存レコードがある場合 → 上書き更新
            existing.record = [r.dict() for r in request.record]
            db.commit()
            db.refresh(existing)
            return {"message": "Time record updated", "id": existing.id}
        else:
            # 新規レコードを作成
            new_record = TimeRecord(
                user_id=request.user_id,
                record_date=request.record_date,
                record=[r.dict() for r in request.record]
            )
            db.add(new_record)
            db.commit()
            db.refresh(new_record)
            return {"message": "Time record created", "id": new_record.id}

    except Exception as e:
        print("エラー:", str(e))
        raise HTTPException(status_code=500, detail="DB保存に失敗しました")

@router.post("/get-time-records")
def get_range_record(request: TimeRecordRangeRequest, db: Session = Depends(get_db)):
    try:
        records = db.query(TimeRecord).filter(
            TimeRecord.user_id == request.user_id,
            TimeRecord.record_date >= request.start_date,
            TimeRecord.record_date <= request.end_date
        ).all()

        if not records:
            return {
                "message": "記録は見つかりませんでした。",
                "records": []
            }

        # レコードあり → そのまま返す（必要に応じて整形）
        return {
            "message": f"{len(records)} 件の記録を取得しました。",
            "records": [r.__dict__ for r in records]
        }

    except Exception as e:
        print("❌ 記録取得エラー:", str(e))
        raise HTTPException(status_code=500, detail="記録取得中にエラーが発生しました")