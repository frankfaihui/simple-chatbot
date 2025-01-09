from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.chatbot_service import ChatbotService

router = APIRouter()
chatbot = ChatbotService()

active_connections = {}

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = f"client-{id(websocket)}"
    active_connections[client_id] = websocket

    try:
        while True:
            message = await websocket.receive_text()
            response = chatbot.generate_response(message)
            await websocket.send_text(response)
    except WebSocketDisconnect:
        del active_connections[client_id]
        print(f"Connection closed: {client_id}")
