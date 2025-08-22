// src/store/timeRecordSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { apiFetch } from "../../utils/api";


// 非同期アクション
export const fetchTimeRecords = createAsyncThunk(
  "timeRecords/fetch",
  async ({ staffId, startDate, endDate }, thunkAPI) => {
    const response = await apiFetch("/get-time-records", {
      method: "POST",
      body: { staff_id: staffId, start_date: startDate, end_date: endDate },
    });
    return response.records;
  }
);

const timeRecordSlice = createSlice({
  name: "timeRecords",
  initialState: {
    record: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeRecords.fulfilled, (state, action) => {
        state.record = action.payload;
        state.loading = false;
      })
      .addCase(fetchTimeRecords.rejected, (state, action) => {
        state.loading = false;
        state.record = null;
        state.error = action.error.message || "取得に失敗しました";
      });
  },
});

export default timeRecordSlice.reducer;
