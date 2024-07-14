import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError


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


DATABASE_URL = os.getenv("DATABASE_URL")

# Creates SQLAlchemy engine with a pool of connections to our database
# Starts from 10 connections and can go up to 20
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)

# Creates a session factory. Sessions are what we use to interact with the database through connections.
# Essentially sessions translate our queries into SQL and sends that SQL through connections
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Creates a session to interact with the database from
# Each endpoint that needs acccess to the database will be given a session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        raise
    finally:
        db.close()


@app.get("/")
async def main():
    return {"message": "Hello World"}
