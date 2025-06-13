// src/App
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIdleTimer } from "react-idle-timer";
import { useState, useEffect } from "react";

import { websocketActionTypes } from "./store/middlewares/websocketActionTypes";
import NotificationSnackbar from "./components/NotificationSnackbar";
import { StopwatchProvider } from "./constants/StopwatchProvider";
import IdleTimeoutDialog from "./components/IdleTimeoutDialog";
import { hideSnackbar } from "./store/slices/snackbarSlice";
import ProtectedLayout from "./components/ProtectedLayout";
import { performLogout } from "./utils/auth";
import TimelineView from "./pages/Timeline";
import RecordsPage from "./pages/Record";
import LoginPage from "./pages/Login";
import AdminPage from "./pages/Admin";
import MainPage from "./pages/Main";

// アイドルタイマーの設定時間 TODO: タイムスタディなので必要なのか検討
// TODO: セッションタイムを決める
const IDLE_TIMEOUT = 6 * 60 * 60 * 1000; // 6時間
// const IDLE_TIMEOUT = 30 * 60 * 10000; // 30分
// const IDLE_TIMEOUT = 10 * 1000; // 10秒 テスト用

function App() {
  const dispatch = useDispatch();
  const [isIdleModalOpen, setIsIdleModalOpen] = useState(false);
  const uid = useSelector((state) => state.auth.id);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // ルートパスのリダイレクト用に認証状態を取得

  useEffect(() => {
    if (isAuthenticated && uid) {
      dispatch({ type: websocketActionTypes.SOCKET_CONNECTION_INIT });
    }
  }, [isAuthenticated, uid, dispatch]);

  // 通知バーの状態を取得
  const {
    open: snackbarOpen,
    message: snackbarMessage,
    severity: snackbarSeverity,
  } = useSelector((state) => state.snackbar);

  // アイドル状態になったときの処理
  const handleOnIdle = () => {
    if (isAuthenticated && !isIdleModalOpen) {
      setIsIdleModalOpen(true);
    }
  };

  // モーダルの確認ボタン（ログアウト処理）
  const handleLogoutConfirm = () => {
    // ログアウトし、モーダルを閉じる
    performLogout(dispatch);
    setIsIdleModalOpen(false);
  };

  // 通知バー を閉じるハンドラ (Redux アクションをディスパッチ)
  const handleSnackbarClose = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideSnackbar()); // Snackbar を閉じるアクション
  };

  // useIdleTimerフック
  useIdleTimer({
    timeout: IDLE_TIMEOUT, // タイムアウト時間
    onIdle: handleOnIdle, // アイドル状態になったときに呼ばれる関数
    debounce: 500, // イベント処理のデバウンス
    disabled: !isAuthenticated, // 未ログインの時は無効
  });

  return (
    <StopwatchProvider>
      <BrowserRouter>
        <Routes>
          {/* ログインページ*/}
          <Route path="/login" element={<LoginPage />} />

          {/* 認証が必要なページ*/}
          <Route element={<ProtectedLayout />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="/records" element={<RecordsPage />} />
            {/* ここにページを追加 */}
          </Route>

          {/* "/"にアクセスした場合 */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/main" replace /> // 認証済みはメイン画面へ
              ) : (
                <Navigate to="/login" replace /> // 未認証
              )
            }
          />

          {/* エラーページの設定 */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </BrowserRouter>

      <IdleTimeoutDialog
        isOpen={isIdleModalOpen}
        onConfirm={handleLogoutConfirm}
      />

      {/* 通知コンポーネント */}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
        autoHideDuration={2000} // 表示時間
      />
    </StopwatchProvider>
  );
}

export default App;
