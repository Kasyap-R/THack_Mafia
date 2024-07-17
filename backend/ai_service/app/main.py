import os
import json
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    APIRouter,
    UploadFile,
    File,
    WebSocket,
    WebSocketDisconnect,
)
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from .services import (
    getEmbeddings,
    scrape,
    generatePlots,
    setup,
    query_model,
    agent_organizer,
    get_summary,
)
import shutil
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

app = FastAPI()

HOST_URL = os.getenv("HOST_URL")

router = APIRouter()

# Allow front-end to make requests
origins = [
    f"{HOST_URL}:3000",
    f"{HOST_URL}:6500",
    "*",  # Used for local testing (i.e. Postman or curl)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.get("/")
async def login():
    return "hello-world"


def delete_all_files_in_directory(directory_path):
    try:
        # Check if the directory exists
        if not os.path.exists(directory_path):
            print(f"The directory {directory_path} does not exist.")
            return False

        # Iterate over all the entries in the directory
        for entry in os.listdir(directory_path):
            # Create full path
            full_path = os.path.join(directory_path, entry)

            # If entry is a file, delete it
            if os.path.isfile(full_path) or os.path.islink(full_path):
                os.unlink(full_path)
            # If entry is a directory, delete it and all its contents
            elif os.path.isdir(full_path):
                shutil.rmtree(full_path)

        print(f"All files and subdirectories in {directory_path} have been deleted.")
        return True

    except Exception as e:
        print(f"An error occurred while deleting files: {e}")
        return False


@router.post("/upload/")
async def upload(files: List[UploadFile] = File(...)):
    print("entering upload")
    directory = "./app/Files/"
    imp_file_dir = "./ImpFiles/"
    faiss_index_dir = "./faiss_index/"
    delete_all_files_in_directory(directory)
    delete_all_files_in_directory(imp_file_dir)
    delete_all_files_in_directory(faiss_index_dir)

    saved_files = []

    for file in files:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400, detail=f"file {file.filename} is not a pdf"
            )
        file_path = os.path.join(directory, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

    scrape(directory)
    setup()
    return {"Code": "Success"}


@router.get("/files")
async def get_files():
    try:
        files = os.listdir("./app/Files")
        return {"files": files}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Files directory not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# @router.get("/scrape/")
# async def scrape_docs():
#     return scrape('./ai_service/Files')


class AIRequest(BaseModel):
    query: str


@router.post("/query/")
async def queryTest(AI_request: AIRequest):
    return agent_organizer(AI_request.query)
    # "Give me a PiChart of the distribution of funds for alphabet")
    # "How much money does alphabet on avoiding CO2 emmisions")
    # "Give me a PiChart of the distribution of funds for alphabet")
    # "How much money does alphabet on avoiding CO2 emmisions")

    # generateMatPlotLibCode


class ChatLogRequest(BaseModel):
    logs: str


@router.post("/summary/")
async def summarize(chat_logs: ChatLogRequest):
    return get_summary(chat_logs.logs)


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
        if response["type"] == "llm-response":
            llm_answer = response["content"]
        elif response["type"] == "screen-update":
            screen_image = response["content"][0]["List_charts"]

        updated_content = SharedContent(
            llm_answer=llm_answer,
            username=username,
            user_msg=data["query"],
            screen_image=screen_image,
        )
        await update_shared_state(meeting_id, updated_content)


@app.websocket("/ws/{meeting_id}/{username}")
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


app.include_router(router, prefix="/ai")
