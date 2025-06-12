// src/utils/auth
import { logout } from "../store/slices/authSlice";
import { removeItem } from "./localStorageUtils";

export const performLogout = (dispatch) => {
  // Reduxの認証状態リセット
  dispatch(logout());

  // ローカルストレージから削除
  removeItem("access_token");
  removeItem("userId");
  removeItem("userName");
  removeItem("version");
  removeItem("role");
};
