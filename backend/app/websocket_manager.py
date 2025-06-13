# app/websocket_manager.py

from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections = {}  # ← defaultdict ではなく dict に変更

    async def connect(self, uid: str, websocket: WebSocket):
        await websocket.accept()
        if uid not in self.active_connections:
            self.active_connections[uid] = []
        self.active_connections[uid].append(websocket)
        # print(f"[{uid}] ✅ connected")

    def disconnect(self, uid: str, websocket: WebSocket):
        if uid in self.active_connections and websocket in self.active_connections[uid]:
            self.active_connections[uid].remove(websocket)
            # print(f"[{uid}] 🔌 removed 1 connection")
            if not self.active_connections[uid]:  # 接続が0になったら削除
                del self.active_connections[uid]
                # print(f"[{uid}] ❌ no more active connections, removed uid")
        else:
            print(f"[{uid}] ⚠️ connection not found for disconnect")

    async def force_logout_all(self, uid: str, exclude=None):
        if uid not in self.active_connections:
            return

        for ws in list(self.active_connections[uid]):
            if ws != exclude:
                await ws.send_json({"event": "force_logout", "reason": "admin"})
                await ws.close()
                self.active_connections[uid].remove(ws)

        if not self.active_connections[uid]:
            del self.active_connections[uid]

    def get_active_uids(self):
        """現在接続中のUID一覧"""
        return [uid for uid, conns in self.active_connections.items() if conns]


# websocketを保持
manager = WebSocketManager()
