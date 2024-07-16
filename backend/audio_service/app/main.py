from fastapi import FastAPI, WebSocket, APIRouter, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict
import os, json

app = FastAPI()

HOST_URL = os.getenv("HOST_URL")

router = APIRouter()


origins = [
    f"http://{HOST_URL}:3000",  # Allow front-end to make requests
    "*",  # Used for local testing (i.e. Postman or curl)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.websocket("/peerjs")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            if data.get("type") == "LEAVE":
                break
    except WebSocketDisconnect:
        pass


@router.get("/")
async def peerjs_info():
    return JSONResponse(content={"version": "1.0", "name": "PeerJS Server"})


@router.post("/id")
async def generate_client_id():
    # Implement your ID generation logic here
    return JSONResponse(content={"id": "generated_id"})


@router.post("/offer")
async def handle_offer(request: Request):
    # Handle PeerJS offers
    body = await request.json()
    # Implement your offer handling logic here
    return JSONResponse(content={"success": True})


app.include_router(router, prefix="/audio")
