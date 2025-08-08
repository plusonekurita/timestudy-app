from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Date, DateTime, ForeignKey, JSON
# import datetime
from datetime import datetime, timezone, date, timedelta
from app.db.database import Base

JST = timezone(timedelta(hours=9))  # 日本時間タイムゾーン

class StaffSurveys(Base):
    __tablename__ = "staff_surveys"

    id: Mapped[int] = mapped_column(primary_key=True)
    staff_id: Mapped[int] = mapped_column(ForeignKey("staffs.id"))
    record_date: Mapped[date] = mapped_column(Date)
    record: Mapped[dict] = mapped_column(JSON, nullable=False)  # 配列形式のJSONもOK

    srs18_total: Mapped[int] = mapped_column()
    motivation_diff_category: Mapped[int] = mapped_column()

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(JST)
)

