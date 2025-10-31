from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from app.models.offices import Offices
from app.models.staffs import Staffs
from app.db.database import SessionLocal
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))

def create_initial_users_and_offices():
    db: Session = SessionLocal()
    try:

        # テスト事業所
        if not db.query(Offices).filter(Offices.name == "プラスワン").first():
            office = Offices(
                name="プラスワン",
                address="東京都中央区1-1-1",
                phone_number="03-0000-0000",
                email="test@example.com",
                is_active=True
            )
            db.add(office)
            db.commit()
            db.refresh(office)  # office.id を取得するため

        else:
            office = db.query(Offices).filter(Offices.name == "プラスワン").first()

        # === Staffs: テスト太郎 ===
        if not db.query(Staffs).filter(Staffs.name == "栗田").first():
            if office:
                staff = Staffs(
                    name="栗田",
                    office_id=office.id,
                    login_id="kurita",
                    password=bcrypt.hash("1964101001"),
                    staff_code="0001",
                    is_active=True,
                    is_admin=True,
                )
                db.add(staff)

        if not db.query(Staffs).filter(Staffs.name == "テスト 職員").first():
            if office:
                staff2 = Staffs(
                    name="テスト 職員",
                    office_id=office.id,
                    login_id="test",
                    password=bcrypt.hash("1964101001"),
                    staff_code="0002",
                    is_active=True,
                    is_admin=False,
                )
                db.add(staff2)
                db.commit()
        print("✅ テストデータを登録しました")
    finally:
        db.close()
