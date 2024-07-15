from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Base, User
from .models import UserExists, UserCredentials
from .services import does_user_exist
import os

app = FastAPI()

HOST_URL = os.getenv("HOST_URL")

router = APIRouter()

# Allow front-end to make requests
origins = [
    f"{HOST_URL}:3000",
    "*",  # Used for local testing (i.e. Postman or curl)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.get("/login/{username}/{password}", response_model=UserExists)
async def login(username: str, password: str, db: Session = Depends(get_db)):
    if does_user_exist(UserCredentials(username=username, password=password), db):
        return UserExists(user_exists=True)
    else:
        return UserExists(user_exists=False)


@router.post(
    "/create_user", status_code=status.HTTP_201_CREATED, response_model=UserExists
)
async def create_user(creds: UserCredentials, db: Session = Depends(get_db)):
    if does_user_exist(creds, db):
        return UserExists(user_exists=True)
    new_user = User(username=creds.username, password=creds.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserExists(user_exists=False)


# Include the router with the prefix
app.include_router(router, prefix="/auth")
