// src/App
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIdleTimer } from "react-idle-timer";
import { useState, useEffect } from "react";

import NotificationSnackbar from "./components/NotificationSnackbar";
import TimeStudySurvey from "./pages/surveySheet/TimeStudySurvey";
import { StopwatchProvider } from "./constants/StopwatchProvider";
import IdleTimeoutDialog from "./components/IdleTimeoutDialog";
import { showSnackbar } from "./store/slices/snackbarSlice";
import { hideSnackbar } from "./store/slices/snackbarSlice";
import ProtectedLayout from "./components/ProtectedLayout";
import StaffSurvey from "./pages/surveySheet/StaffSurvey";
import UserSurvey from "./pages/surveySheet/UserSurvey";
import SectionCompletePage from "./pages/sheetComplete";
import SheetListPage from "./pages/sheetList";
import { performLogout } from "./utils/auth";
import TimelineView from "./pages/Timeline";
import StaffSheet from "./pages/staffSheet";
import RecordsPage from "./pages/Record";
import { apiFetch } from "./utils/api";
import TopMenu from "./pages/TopMenu";
import LoginPage from "./pages/Login";
import AdminPage from "./pages/Admin";
import MainPage from "./pages/Main";

// アイドルタイマーの設定時間 TODO: タイムスタディなので必要なのか検討
const IDLE_TIMEOUT = 6 * 60 * 60 * 1000; // 6時間
// const IDLE_TIMEOUT = 30 * 60 * 10000; // 30分
// const IDLE_TIMEOUT = 10 * 1000; // 10秒 テスト用

function App() {
  const dispatch = useDispatch();
  const [isIdleModalOpen, setIsIdleModalOpen] = useState(false);

  // ルートパスのリダイレクト用に認証状態を取得
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

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
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/menu" element={<TopMenu />} />

            <Route path="/time" element={<MainPage />} />
            <Route path="/time/timeline" element={<TimelineView />} />
            <Route path="/time/records" element={<RecordsPage />} />

            <Route path="/sheetList" element={<SheetListPage />} />
            <Route path="/sheetList/staff" element={<StaffSheet />} />
            <Route
              path="/sheetList/complete"
              element={<SectionCompletePage />}
            />

            <Route path="/survey-sheet/time" element={<TimeStudySurvey />} />
            <Route path="/survey-sheet/staff" element={<StaffSurvey />} />
            <Route path="/survey-sheet/user" element={<UserSurvey />} />

            {/* ここにページを追加 */}
          </Route>

          {/* "/"にアクセスした場合 */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/menu" replace /> // 認証済みはメニュー画面へ
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
