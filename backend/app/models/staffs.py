from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Date, Boolean, ForeignKey, DateTime, func
from datetime import datetime, timezone, timedelta
from app.db.database import Base
from sqlalchemy.orm import relationship
from app.models.offices import Offices

JST = timezone(timedelta(hours=9))
def jst_now():
    return datetime.now(JST)

class Staffs(Base):
    __tablename__ = "staffs"

    id: Mapped[int] = mapped_column(primary_key=True)
    office_id: Mapped[int] = mapped_column(ForeignKey("offices.id"))  # 外部キーと仮定
    login_id: Mapped[str] = mapped_column(String(50), unique=True)     # ログインID（重複不可）
    password: Mapped[str] = mapped_column(String(255))                 # パスワード（ハッシュ化前提）
    name: Mapped[str] = mapped_column(String(100))
    staff_code: Mapped[str] = mapped_column(String(50))
    job: Mapped[str] = mapped_column(String(50), nullable=True)  # 職種
    email: Mapped[str] = mapped_column(String(100), nullable=True)     # メールアドレス（null可）
    phone_number: Mapped[str] = mapped_column(String(20), nullable=True)  # 電話番号（null可）
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
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    office: Mapped["Offices"] = relationship("Offices", backref="staffs")
