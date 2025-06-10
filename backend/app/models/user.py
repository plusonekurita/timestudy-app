from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, func
from datetime import datetime, timedelta, timezone
from app.db.database import Base
JST = timezone(timedelta(hours=9))

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    uid: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    password: Mapped[str] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    version: Mapped[int] = mapped_column(Integer, default=0)  # 0=free, 1=pro
    role: Mapped[str] = mapped_column(String, default="user")
    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(JST))
