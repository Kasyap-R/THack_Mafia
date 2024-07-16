from fastapi import FastAPI, WebSocket, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import os

app = FastAPI()
connections: Dict[int, WebSocket] = {}

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


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    connections[user_id] = websocket
    connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_bytes()
            for uid, connection in connections.items():
                if uid != user_id:
                    await connection.send_bytes(data)
    except Exception as e:
        del connections[user_id]
        await websocket.close()


app.include_router(router, prefix="/audio")
