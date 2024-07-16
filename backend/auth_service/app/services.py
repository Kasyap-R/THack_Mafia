# Helper functions to deal with the logic of endpoints in this service
from sqlalchemy.orm import Session
from .models import UserCredentials
from database.models import User


def does_user_exist(creds: UserCredentials, db: Session) -> int | None:
    user = db.query(User).filter(User.username == creds.username).first()
    if user:
        print("Found User")
        return user
    return None
