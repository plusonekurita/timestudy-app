import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://timestudy_db_7yhl_user:0y6Tmj2464cgvxUDfNbwGNINxXvCuILA@dpg-d1sp1v6mcj7s73aovdh0-a.singapore-postgres.render.com/timestudy_db_7yhl?sslmode=require")
print("📡 DATABASE_URL:", DATABASE_URL)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
