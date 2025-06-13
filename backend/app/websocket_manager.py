# app/websocket_manager.py

from fastapi import WebSocket
from collections import defaultdict

class WebSocketManager:
    def __init__(self):
        self.active_connections = defaultdict(list)

    async def connect(self, uid: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[uid].append(websocket)
        print(f"[{uid}] ✅ connected")

    def disconnect(self, uid: str, websocket: WebSocket):
        if websocket in self.active_connections[uid]:
            self.active_connections[uid].remove(websocket)

    async def force_logout_all(self, uid: str, exclude=None):
        # print(f"[{uid}] 🔐 接続数: {len(self.active_connections[uid])}")
        for ws in list(self.active_connections[uid]):
            if ws != exclude:
                # print(f"[{uid}] 🚫 force logout sending to websocket")
                await ws.send_json({"event": "force_logout"})
                await ws.close()
                self.active_connections[uid].remove(ws)


# websocketを保持
manager = WebSocketManager()
