// .src/store/rootReducer
import { combineReducers } from "@reduxjs/toolkit";

import snackbarReducer from "./slices/snackbarSlice";
import authReducer from "./slices/authSlice";

// 複数のreducerをまとめる
export const rootReducer = combineReducers({
  auth: authReducer,
  snackbar: snackbarReducer,
});
