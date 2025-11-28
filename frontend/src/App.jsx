// src/App
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIdleTimer } from "react-idle-timer";
import { useState, useEffect, useRef, useCallback } from "react";

import TimeStudySurvey from "./pages/pc/surveySheet/TimeStudySurvey";
import NotificationSnackbar from "./components/NotificationSnackbar";
import { StopwatchProvider } from "./constants/StopwatchProvider";
import SectionCompletePage from "./pages/mobile/sheetComplete";
import IdleTimeoutDialog from "./components/IdleTimeoutDialog";
import StaffSurvey from "./pages/pc/surveySheet/StaffSurvey";
import { hideSnackbar } from "./store/slices/snackbarSlice";
import ProtectedLayout from "./components/ProtectedLayout";
import Management from "./pages/pc/management/Management";
import StaffList from "./pages/pc/management/StaffList";
import StaffForm from "./pages/pc/management/StaffForm";
import CreateReport from "./pages/pc/report/CreateReport";
import SheetListPage from "./pages/mobile/sheetList";
import TimelineView from "./pages/mobile/Timeline";
import StaffSheet from "./pages/mobile/staffSheet";
import RecordsPage from "./pages/mobile/Record";
import { TimeStudy } from "./pages/pc/record";
import { performLogout } from "./utils/auth";
import MainPage from "./pages/mobile/Main";
import TopMenu from "./pages/TopMenu";
import LoginPage from "./pages/Login";
import AdminPage from "./pages/Admin";
import AddOfficePage from "./pages/Admin/AddOffice";
import OfficesPage from "./pages/Admin/Offices";
import StaffsPage from "./pages/Admin/Staffs";
import {
  isSessionValid,
  getSessionTimeout,
  initSessionBroadcast,
  listenSessionLogout,
  saveSessionStart,
} from "./utils/sessionManager";

// セッションタイムアウト時間（テスト用：10秒、本番では3時間）
const SESSION_TIMEOUT = getSessionTimeout();

function App() {
  const dispatch = useDispatch();
  const [isIdleModalOpen, setIsIdleModalOpen] = useState(false);
  const sessionCheckIntervalRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // ルートパスのリダイレクト用に認証状態を取得
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // 通知バーの状態を取得
  const {
    open: snackbarOpen,
    message: snackbarMessage,
    severity: snackbarSeverity,
  } = useSelector((state) => state.snackbar);

  // セッションチェックとログアウト処理
  const checkSessionAndLogout = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!isSessionValid()) {
      performLogout(dispatch);
      setIsIdleModalOpen(false);
    }
  }, [isAuthenticated, dispatch]);

  // アイドル状態になったときの処理（セッションタイムアウトチェック）
  const handleOnIdle = () => {
    if (isAuthenticated && !isIdleModalOpen) {
      checkSessionAndLogout();
      if (isAuthenticated) {
        // セッションがまだ有効な場合はモーダルを表示
        setIsIdleModalOpen(true);
      }
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

  // ページロード時と認証状態が変わったときのセッションチェック
  useEffect(() => {
    if (isAuthenticated) {
      // 認証済みの場合、セッション有効性をチェック
      checkSessionAndLogout();
    }
  }, [isAuthenticated, checkSessionAndLogout]);

  // バックグラウンドタイマーで定期的にセッションチェック（1秒ごと）
  useEffect(() => {
    if (isAuthenticated) {
      // 1秒ごとにセッションチェック
      sessionCheckIntervalRef.current = setInterval(() => {
        checkSessionAndLogout();
      }, 1000);

      return () => {
        if (sessionCheckIntervalRef.current) {
          clearInterval(sessionCheckIntervalRef.current);
        }
      };
    } else {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    }
  }, [isAuthenticated, checkSessionAndLogout]);

  // ページの可視性が変わったとき（スリープ復帰時など）にセッションチェック
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        // ページが表示されたときにセッションチェック
        checkSessionAndLogout();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isAuthenticated, checkSessionAndLogout]);

  // タブ間同期の設定
  useEffect(() => {
    if (isAuthenticated) {
      // BroadcastChannelを初期化
      broadcastChannelRef.current = initSessionBroadcast();

      // 他のタブからのログアウト通知をリッスン
      const cleanup = listenSessionLogout(() => {
        console.log("他のタブからログアウト通知を受信");
        performLogout(dispatch);
        setIsIdleModalOpen(false);
      });

      return () => {
        cleanup();
        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.close();
          } catch (error) {
            console.warn("BroadcastChannelのクローズに失敗:", error);
          }
        }
      };
    }
  }, [isAuthenticated]);

  // ユーザーアクションがあったときにセッション開始時刻をリセット
  const handleOnAction = useCallback(() => {
    if (isAuthenticated) {
      saveSessionStart();
    }
  }, [isAuthenticated]);

  // useIdleTimerフック（セッションタイムアウト用）
  useIdleTimer({
    timeout: SESSION_TIMEOUT, // セッションタイムアウト時間
    onIdle: handleOnIdle, // アイドル状態になったときに呼ばれる関数
    onAction: handleOnAction, // ユーザーアクションがあったときに呼ばれる関数
    debounce: 500, // イベント処理のデバウンス
    disabled: !isAuthenticated, // 未ログインの時は無効
    stopOnIdle: false, // アイドル状態でもタイマーを継続
    crossTab: true, // 複数タブ間で状態を共有
    startOnMount: true, // マウント時に開始
    syncTimers: true, // タイマーを同期
    events: [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ], // 監視するイベント
  });

  return (
    <StopwatchProvider>
      <BrowserRouter>
        <Routes>
          {/* ログインページ*/}
          <Route path="/login" element={<LoginPage />} />

          {/* 管理画面（簡易版・公開ルート）*/}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/offices/new" element={<AddOfficePage />} />
          <Route path="/admin/offices" element={<OfficesPage />} />
          <Route path="/admin/staffs" element={<StaffsPage />} />

          {/* 認証が必要なページ*/}
          <Route element={<ProtectedLayout />}>
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

            <Route path="/record">
              <Route path="time" element={<TimeStudy />} />
            </Route>

            <Route path="management" element={<Management />}>
              <Route path="list" element={<StaffList />} />
              <Route path="add" element={<StaffForm />} />
            </Route>

            <Route path="/report/create" element={<CreateReport />} />

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
