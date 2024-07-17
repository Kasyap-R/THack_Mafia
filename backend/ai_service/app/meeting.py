from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)

# Leave Meeting
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
# from database.database import get_db
#from database.models import Base, User
from .utils import generate_unique_id
from .models import Meeting, MeetingCreate, MeetingJoin, MeetingLeave
import os
import base64
import json
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
import tempfile
from .services import agent_organizer

HOST_URL = os.getenv("HOST_URL")

meeting_router = APIRouter()

origins = [
    f"{HOST_URL}:3000",
    f"{HOST_URL}:3001",
    "*",
]

meetings: Dict[str, Meeting] = {}


@meeting_router.get("/")
async def get_all_meetings():
    return [meeting for meeting in meetings.values()]


@meeting_router.get("/{meeting_id}", response_model=Meeting)
async def get_meeting(meeting_id: str):
    if meeting_id not in meetings:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meetings[meeting_id]


@meeting_router.post("/create", response_model=Meeting)
async def create_meeting(meeting: MeetingCreate):
    meeting_id = generate_unique_id()
    new_meeting = Meeting(
        id=meeting_id,
        name=meeting.meeting_name,
        creator_id=meeting.creator_id,
        participants=[meeting.creator_id],
    )
    meetings[meeting_id] = new_meeting
    return new_meeting


@meeting_router.post("/join", response_model=Meeting)
async def join_meeting(meeting_join: MeetingJoin):
    if meeting_join.meeting_id not in meetings:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting = meetings[meeting_join.meeting_id]
    if meeting_join.creator_id in meeting.participants:
        raise HTTPException(status_code=401, detail="user is already in meeting")

    meeting.participants.append(meeting_join.creator_id)

    return meeting


@meeting_router.post("/leave", response_model=Meeting)
async def leave_meeting(meeting_leave: MeetingLeave):
    if meeting_leave.meeting_id not in meetings:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting = meetings[meeting_leave.meeting_id]

    if meeting_leave.user_id not in meeting.participants:
        raise HTTPException(status_code=400, detail="User is not in this meeting")

    meeting.participants.remove(meeting_leave.user_id)

    if not meeting.participants:
        del meetings[meeting_leave.meeting_id]
        raise HTTPException(
            status_code=200, detail="Meeting deleted as last participant left"
        )

    if meeting_leave.user_id == meeting.creator_id and meeting.participants:
        meeting.creator_id = meeting.participants[0]

    return meeting


class ConnectionManager:
    def __init__(self):
        """keep list of active connections for each meeting"""
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_id: str):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = []
        self.active_connections[meeting_id].append(websocket)

    def disconnect(self, websocket: WebSocket, meeting_id: str):
        self.active_connections[meeting_id].remove(websocket)

    async def broadcast(self, message: dict, meeting_id: str):
        for connection in self.active_connections[meeting_id]:
            await connection.send_json(message)


manager = ConnectionManager()

class SharedContent(BaseModel):
    llm_answer: Optional[str] = Field(default=None)
    username: str = Field(default="")
    user_msg: str = Field(default="")
    screen_image: Optional[List] = Field(default=None)

class SharedState(BaseModel):
    content: SharedContent = SharedContent()

shared_states: Dict[str, SharedState] = {}

async def update_shared_state(meeting_id: str, content: SharedContent):
    if meeting_id not in shared_states:
        shared_states[meeting_id] = SharedState()
    shared_states[meeting_id].content = content
    await manager.broadcast(
        {"type": "state_update", "content": content.dict()}, meeting_id
    )

class LLMResponse(BaseModel):
    type: str
    content: Any


def llm_response(query: str):
   response = agent_organizer(query)
   print(response)
   return response

async def process_message(data: dict, meeting_id: str, username: str):
    if data["type"] == "text_query":
        response = llm_response(data["query"])
        llm_answer = None
        screen_image = None
        if response['type'] == "llm-response":
            llm_answer = response['content']
        elif response['type'] == "screen-update":
            screen_image = response['content'][0]["List_charts"]

        updated_content = SharedContent(
            llm_answer=llm_answer,
            username=username,
            user_msg=data["query"],
            screen_image=screen_image,
        )
        await update_shared_state(meeting_id, updated_content)


@meeting_router.websocket("/ws/{meeting_id}/{username}")
async def websocket_endpoint(websocket: WebSocket, meeting_id: str, username: str):
    await manager.connect(websocket, meeting_id)
    try:
        if meeting_id in shared_states:
            await websocket.send_json(
                {
                    "type": "state_update",
                    "content": shared_states[meeting_id].content.dict(),
                }
            )

        while True:
            data = await websocket.receive_json()
            await process_message(data, meeting_id, username)
    except WebSocketDisconnect:
        manager.disconnect(websocket, meeting_id)
    except Exception as e:
        print(f"Error in websocket: {str(e)}")
        manager.disconnect(websocket, meeting_id)


if __name__ == "__main__":
    query1 = "show me some charts for alphabet with a focus on ecology metrics pie charts are preferrable"
    query2 = "tell me something interesting about alphabet"
    query = query1
    response = llm_response(query)
    print(response)
   