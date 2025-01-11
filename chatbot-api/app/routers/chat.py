from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.chatbot_service import ChatbotService

router = APIRouter()
chatbot = ChatbotService()

active_connections = {}

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Use client-{id(websocket)} as a unique thread ID for memory
    client_id = f"client-{id(websocket)}"
    active_connections[client_id] = websocket

    try:
        while True:
            # 1) Receive text from the client
            user_message = await websocket.receive_text()
            # 2) Generate response (pass client_id to preserve conversation)
            response = await chatbot.generate_response(client_id, user_message)
            # 3) Send the AI response back
            await websocket.send_text(response)
    except WebSocketDisconnect:
        del active_connections[client_id]
        print(f"Connection closed: {client_id}")
