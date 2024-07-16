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


origins = [
    f"{HOST_URL}:3000",  # Allow front-end to make requests
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
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = does_user_exist(UserCredentials(username=username, password=password), db)
    if user:
        return UserExists(did_user_exist=True, user_id=user.id, username=user.username)
    else:
        return UserExists(did_user_exist=False, user_id=None, username=None)


@router.post(
    "/create_user", status_code=status.HTTP_201_CREATED, response_model=UserExists
)
def create_user(creds: UserCredentials, db: Session = Depends(get_db)):
    user = does_user_exist(creds, db)
    if user:
        return UserExists(did_user_exist=True, user_id=user.id, username=user.username)
    new_user = User(username=creds.username, password=creds.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserExists(
        did_user_exist=False, user_id=new_user.id, username=new_user.username
    )


# Include the router with the prefix
app.include_router(router, prefix="/auth")
