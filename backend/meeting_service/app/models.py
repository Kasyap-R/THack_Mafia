# Define the data you expect to recieve and return
from pydantic import BaseModel

class Meeting(BaseModel):
    id: str
    name: str
    creator_id: str
    participants: list[str]

class MeetingCreate(BaseModel):
    meeting_name: str
    creator_id: str

class MeetingJoin(BaseModel):
    meeting_id: str
    creator_id: str

class MeetingLeave(BaseModel):
    meeting_id: str
    creator_id: str


