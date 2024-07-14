from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from .models import Base
import os
import time

DATABASE_URL = os.getenv("DATABASE_URL")

# Creates SQLAlchemy engine with a pool of connections to our database
# Starts from 10 connections and can go up to 20
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)


def init_db():
    for _ in range(5):
        try:
            Base.metadata.create_all(engine)
            print("Database initialized successfully")
            return
        except:
            time.sleep(2)
    raise Exception("Failed to initialize database after multiple attempts")


if __name__ == "__main__":
    init_db()
