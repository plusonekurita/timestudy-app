import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // localStorage を使う場合
// import storageSession from 'redux-persist/lib/storage/session' // sessionStorage にする場合
import { createLogger } from "redux-logger";

import websocket from "./middlewares/websocket";
import { rootReducer } from "./rootReducer";

const middleware = [];

// ログの設定
const logger = createLogger({
  colors: {
    title: () => "#ff6347",
    prevState: () => "#9e9e9e",
    action: () => "#03a9f4",
    nextState: () => "#4caf50",
    error: () => "#f44336",
  },
  diff: true,
  collapsed: true,
});

// 永続化の設定
const persistConfig = {
  key: "root", // localStorage に保存される際のキー名
  storage, // 使用するストレージ
  // storage: storageSession, // sessionStorage を使う場合
  whitelist: ["auth"], // 永続化したいReducerのスライス名
  // blacklist: ['counter'] // 永続化しないもの
};

// persistReducer で設定とreducerをラップする
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ログの設定を追加
if (import.meta.env.DEV) {
  middleware.push(logger);
}

export const store = configureStore({
  reducer: persistedReducer,
  // 開発環境のみ
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(websocket) // websocket
      .concat(...middleware), // ログ
});

export const persistor = persistStore(store);
