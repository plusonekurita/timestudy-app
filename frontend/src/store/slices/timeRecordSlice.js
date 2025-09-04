// src/store/timeRecordSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { apiFetch } from "../../utils/api";

// 対応する職員の記録
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

export const fetchOfficeTimeRecords = createAsyncThunk(
  "timeRecord/fetchOfficeTimeRecords",
  async (
    { officeId, startDate, endDate, staffIds = null, includeEmptyStaff = true },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiFetch("/get-time-records/by-office", {
        method: "POST",
        body: {
          office_id: officeId,
          start_date: startDate,
          end_date: endDate, // 単日の時は start==end or end省略でもOK（API側仕様次第）
          staff_ids: staffIds, // 絞り込みしたいときだけ
          include_empty_staff: includeEmptyStaff,
        },
      });
      return res;
    } catch (e) {
      return rejectWithValue(e?.message || "所属全員の記録取得に失敗しました");
    }
  }
);

const timeRecordSlice = createSlice({
  name: "timeRecords",
  initialState: {
    loading: false,
    error: null,

    record: [], // 個人用
    officeRecords: [], // 全員分のフラット配列
    groupedByStaff: {}, // { staffId: [records...] }
    staffMeta: [], // [{id, name}]
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 職員単体
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
      })
      // 事業所職員
      .addCase(fetchOfficeTimeRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficeTimeRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.officeRecords = action.payload?.records || [];
        state.groupedByStaff = action.payload?.grouped_by_staff || {};
        state.staffMeta = action.payload?.staff || [];
      })
      .addCase(fetchOfficeTimeRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "所属全員の記録取得に失敗しました";
      });
  },
});

export default timeRecordSlice.reducer;
