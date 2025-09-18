// src/utils/auth
import { websocketActionTypes } from "../store/middlewares/websocketActionTypes";
import { logout } from "../store/slices/authSlice";
import { resetTimeRecord } from "../store/slices/timeRecordSlice";
import { removeItem } from "./localStorageUtils";

export const performLogout = (dispatch) => {
  // WebSocketの切断
  dispatch({ type: websocketActionTypes.SOCKET_DISCONNECT });

  // Reduxの認証状態リセット
  dispatch(logout());

  // timeRecordストアを初期化
  dispatch(resetTimeRecord());

  // ローカルストレージから削除
  removeItem("user");

  // アクセストークンを削除
  // localStorage.removeItem("access_token");

  // 画像・グラフ関連のローカルストレージを削除
  removeItem("ts_graph_type");
  removeItem("ts_range_start");
  removeItem("ts_range_end");
  removeItem("ts_single_date");
  removeItem("ts_single_staff");
  removeItem("sheet_single_date");
  removeItem("sheet_single_staff");
};
