# app/routers/ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket_manager import manager

router = APIRouter()

@router.websocket("/ws/{uid}")
async def websocket_endpoint(websocket: WebSocket, uid: str):
    await manager.connect(uid, websocket)
    try:
        while True:
            await websocket.receive_text()  # 接続維持のために待機
    except WebSocketDisconnect:
        # print(f"[{uid}] ❌ disconnected")
        manager.disconnect(uid, websocket)
    except Exception as e:
        # print(f"[{uid}] ⚠️ unexpected disconnect: {e}")
        manager.disconnect(uid, websocket)