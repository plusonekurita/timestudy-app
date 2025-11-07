// src/utils/sessionManager.js
// セッション管理ユーティリティ

const SESSION_START_KEY = "session_start_time";
const SESSION_TIMEOUT = 3 * 60 * 60 * 1000; // 3時間（テスト用は 10 * 1000 = 10秒）

/**
 * セッション開始時刻を保存
 */
export const saveSessionStart = () => {
  const startTime = Date.now();
  localStorage.setItem(SESSION_START_KEY, startTime.toString());
  console.log("セッション開始時刻を保存:", new Date(startTime).toLocaleString());
};

/**
 * セッション開始時刻を取得
 * @returns {number|null} セッション開始時刻（ミリ秒）、存在しない場合はnull
 */
export const getSessionStart = () => {
  const startTime = localStorage.getItem(SESSION_START_KEY);
  return startTime ? parseInt(startTime, 10) : null;
};

/**
 * セッション開始時刻をクリア
 */
export const clearSessionStart = () => {
  localStorage.removeItem(SESSION_START_KEY);
  console.log("セッション開始時刻をクリア");
};

/**
 * セッションが有効かどうかをチェック
 * @returns {boolean} セッションが有効な場合true、タイムアウトしている場合false
 */
export const isSessionValid = () => {
  const startTime = getSessionStart();
  if (!startTime) {
    return false;
  }

  const elapsed = Date.now() - startTime;
  const isValid = elapsed < SESSION_TIMEOUT;
  
  if (!isValid) {
    console.log(`セッションタイムアウト: ${elapsed}ms経過（タイムアウト: ${SESSION_TIMEOUT}ms）`);
  }
  
  return isValid;
};

/**
 * セッションの残り時間を取得（ミリ秒）
 * @returns {number|null} 残り時間（ミリ秒）、セッションが存在しない場合はnull
 */
export const getRemainingTime = () => {
  const startTime = getSessionStart();
  if (!startTime) {
    return null;
  }

  const elapsed = Date.now() - startTime;
  const remaining = SESSION_TIMEOUT - elapsed;
  return remaining > 0 ? remaining : 0;
};

/**
 * セッションタイムアウト時間を取得
 * @returns {number} タイムアウト時間（ミリ秒）
 */
export const getSessionTimeout = () => {
  return SESSION_TIMEOUT;
};

/**
 * タブ間でセッション状態を同期するためのBroadcastChannel
 */
let broadcastChannel = null;

export const initSessionBroadcast = () => {
  if (typeof BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel("session_channel");
      return broadcastChannel;
    } catch (error) {
      console.warn("BroadcastChannelの初期化に失敗:", error);
      return null;
    }
  }
  return null;
};

/**
 * セッションログアウトを全タブに通知
 */
export const broadcastLogout = () => {
  // BroadcastChannelが存在し、閉じられていない場合のみ送信
  if (broadcastChannel) {
    try {
      // チャンネルの状態をチェック（readyStateプロパティがない場合はtry-catchで対応）
      if (broadcastChannel.readyState === "open" || broadcastChannel.readyState === undefined) {
        broadcastChannel.postMessage({ type: "LOGOUT" });
      }
    } catch (error) {
      console.warn("BroadcastChannelへの送信に失敗:", error);
      // エラーが発生した場合はチャンネルをnullにリセット
      broadcastChannel = null;
    }
  }
  
  // フォールバック: localStorageイベントを使用（常に実行）
  try {
    localStorage.setItem("session_logout", Date.now().toString());
    setTimeout(() => {
      localStorage.removeItem("session_logout");
    }, 100);
  } catch (error) {
    console.warn("localStorageへの書き込みに失敗:", error);
  }
};

/**
 * セッションログアウトの通知をリッスン
 * @param {Function} callback ログアウト時に呼ばれるコールバック
 * @returns {Function} クリーンアップ関数
 */
export const listenSessionLogout = (callback) => {
  const cleanupFunctions = [];

  // BroadcastChannelを使用
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel("session_channel");
      const handler = (event) => {
        if (event.data && event.data.type === "LOGOUT") {
          callback();
        }
      };
      channel.addEventListener("message", handler);
      cleanupFunctions.push(() => {
        try {
          channel.removeEventListener("message", handler);
          if (channel.readyState === "open" || channel.readyState === undefined) {
            channel.close();
          }
        } catch (error) {
          console.warn("BroadcastChannelのクリーンアップに失敗:", error);
        }
      });
    } catch (error) {
      console.warn("BroadcastChannelの作成に失敗:", error);
    }
  }

  // localStorageイベントを使用（フォールバック）
  const storageHandler = (event) => {
    if (event.key === "session_logout") {
      callback();
    }
  };
  window.addEventListener("storage", storageHandler);
  cleanupFunctions.push(() => {
    window.removeEventListener("storage", storageHandler);
  });

  return () => {
    cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("クリーンアップ関数の実行に失敗:", error);
      }
    });
  };
};

