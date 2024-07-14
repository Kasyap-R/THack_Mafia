import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from database.database import get_db
from database.models import Base

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(Base)

DATABASE_URL = os.getenv("DATABASE_URL")

# Creates SQLAlchemy engine with a pool of connections to our database
# Starts from 10 connections and can go up to 20
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)


@app.get("/")
async def main():
    return {"message": "Hello World"}
