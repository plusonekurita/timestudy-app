// src/utils/auth
import { websocketActionTypes } from "../store/middlewares/websocketActionTypes";
import { logout } from "../store/slices/authSlice";
import { removeItem } from "./localStorageUtils";

export const performLogout = (dispatch) => {
  // WebSocketの切断
  dispatch({ type: websocketActionTypes.SOCKET_DISCONNECT });

  // Reduxの認証状態リセット
  dispatch(logout());

  // ローカルストレージから削除
  removeItem("user");
};
