import { websocketActionTypes } from "./websocketActionTypes";
import { performLogout } from "../../utils/auth";

let socket;

const websocket =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    switch (action.type) {
      case websocketActionTypes.SOCKET_CONNECTION_INIT: {
        const state = getState();
        const uid = state.auth?.uid;

        if (!uid) {
          console.warn("UIDが未定義です。WebSocket接続を中止します。");
          break;
        }

        if (socket) {
          socket.close();
        }

        const host = window.location.hostname;
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const port = import.meta.env.VITE_API_PORT;

        socket = new WebSocket(`${protocol}://${host}:${port}/ws/${uid}`);

        socket.onopen = () => {
          // console.log("[WebSocket] ✅ 接続成功");
          dispatch({ type: websocketActionTypes.SOCKET_CONNECTION_SUCCESS });
        };

        socket.onerror = (err) => {
          console.error("[WebSocket] ❌ エラー:", err);
          dispatch({ type: websocketActionTypes.SOCKET_CONNECTION_ERROR });
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "force_logout") {
              alert("他の端末からログインされたためログアウトしました");
              performLogout(dispatch);
              socket.close();
            } else {
              dispatch({
                type: websocketActionTypes.SOCKET_MESSAGE,
                payload: data,
              });
            }
          } catch (e) {
            console.error("WebSocket メッセージ解析エラー:", e);
          }
        };

        socket.onclose = () => {
          dispatch({ type: websocketActionTypes.SOCKET_CONNECTION_CLOSED });
        };
        break;
      }

      // 接続解除
      case websocketActionTypes.SOCKET_DISCONNECT:
        if (socket) {
          socket.close();
          socket = null;
        }
        break;

      default:
        break;
    }

    return next(action);
  };

export default websocket;
