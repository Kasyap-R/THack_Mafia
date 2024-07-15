# Define the data you expect to recieve and return
from pydantic import BaseModel


class UserCredentials(BaseModel):
    username: str
    password: str


class UserExists(BaseModel):
    user_exists: bool
