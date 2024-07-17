# Define the data you expect to recieve and return
from pydantic import BaseModel


class UserCredentials(BaseModel):
    username: str
    password: str


class UserExists(BaseModel):
    did_user_exist: bool
    user_id: int | None
    username: str | None

class UserModel(BaseModel):
    user_id: int
    username: str

    class config:
        orm_mode = True
