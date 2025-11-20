from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Date, Boolean, Text, DateTime, func
from datetime import datetime, timezone, timedelta
from app.db.database import Base

JST = timezone(timedelta(hours=9))
def jst_now():
    return datetime.now(JST)

class Offices(Base):
    __tablename__ = "offices"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))  # 事業所名
    jigyousyo_no: Mapped[str] = mapped_column(String(10), nullable=True)  # 事業所番号（10桁まで）
    postal_code: Mapped[str] = mapped_column(String(10), nullable=True)  # 郵便番号
    address: Mapped[str] = mapped_column(Text, nullable=True)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=jst_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=jst_now,
        onupdate=jst_now
    )

    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true", default=True)
