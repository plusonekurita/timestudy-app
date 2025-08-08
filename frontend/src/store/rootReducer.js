// .src/store/rootReducer
import { combineReducers } from "@reduxjs/toolkit";

import timeRecordReducer from "./slices/timeRecordSlice";
import snackbarReducer from "./slices/snackbarSlice";
import loadingReducer from "./slices/loadingSlice";
import staffReducer from "./slices/staffSlice";
import authReducer from "./slices/authSlice";

// 複数のreducerをまとめる
export const rootReducer = combineReducers({
  auth: authReducer,
  snackbar: snackbarReducer,
  staff: staffReducer,
  loading: loadingReducer,
  timeRecord: timeRecordReducer,
});
