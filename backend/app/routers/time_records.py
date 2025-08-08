from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import List, Dict, Any
from app.db.database import get_db
from app.models.time_record import TimeRecord
from app.utils.time_conversion import convert_with_time_split

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
    staff_id: int
    record_date: date
    record: List[RecordEntry]

class TimeRecordRangeRequest(BaseModel):
    staff_id: int
    start_date: date # YYYY-MM-DD
    end_date: date # YYYY-MM-DD

@router.post("/save-time-records")
def create_time_record(request: TimeRecordRequest, db: Session = Depends(get_db)):
    try:
        # 既に同じ staff_id + record_date のレコードがあるか確認
        existing = db.query(TimeRecord).filter_by(
            staff_id=request.staff_id,
            record_date=request.record_date
        ).first()

        if existing:
            # 既存レコードがある場合 → 上書き更新
            existing.record = [r.model_dump() for r in request.record] # レコードの上書き
            db.commit()
            db.refresh(existing)
            return {"message": "Time record updated", "id": existing.id}
        else:
            # 新規レコードを作成
            new_record = TimeRecord(
                staff_id=request.staff_id,
                record_date=request.record_date,
                record=[r.model_dump() for r in request.record]
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
    print(request)
    try:
        query = db.query(TimeRecord).filter(
            TimeRecord.staff_id == request.staff_id
        )

        # end_date がない or start_date と同じ → 単一日付の扱い
        if not request.end_date or request.start_date == request.end_date:
            query = query.filter(TimeRecord.record_date == request.start_date)
            record = query.first()

            if not record:
                return {
                    "message": "記録は見つかりませんでした。",
                    "record": None
                }

            return {
                "message": "1件の記録を取得しました。",
                "record": record.__dict__
            }

        # 範囲指定 → 複数件
        else:
            query = query.filter(
                TimeRecord.record_date >= request.start_date,
                TimeRecord.record_date <= request.end_date
            )
            records = query.all()

            if not records:
                return {
                    "message": "記録は見つかりませんでした。",
                    "records": []
                }

            return {
                "message": f"{len(records)} 件の記録を取得しました。",
                "records": [r.__dict__ for r in records]
            }

    except Exception as e:
        print("❌ 記録取得エラー:", str(e))
        raise HTTPException(status_code=500, detail="記録取得中にエラーが発生しました")



@router.post("/convert-time-records")
def convert_time_records(request: TimeRecordRequest):
    try:
        # Pydantic RecordEntry → dict に変換
        records_as_dict = [r.model_dump() for r in request.record]

        # 時間変換処理
        converted = convert_with_time_split(records_as_dict)

        return {
            "message": "変換に成功しました。",
            "converted": converted
        }
    except Exception as e:
        print("❌ 変換エラー:", str(e))
        raise HTTPException(status_code=500, detail="変換処理に失敗しました")