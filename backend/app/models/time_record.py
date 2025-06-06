from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Date, DateTime, ForeignKey, JSON
# import datetime
from datetime import datetime, timezone, date, timedelta
from app.db.database import Base

JST = timezone(timedelta(hours=9))  # 日本時間タイムゾーン

class TimeRecord(Base):
    __tablename__ = "time_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    record_date: Mapped[date] = mapped_column(Date)
    record: Mapped[dict] = mapped_column(JSON, nullable=False)  # 配列形式のJSONもOK
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(JST)
)
