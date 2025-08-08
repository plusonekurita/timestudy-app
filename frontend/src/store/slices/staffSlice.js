import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  staffList: [],
  selectedStaff: null,
  loading: false,
  error: null,
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setStaffList: (state, action) => {
      state.staffList = action.payload;
    },
    selectStaff: (state, action) => {
      state.selectedStaff = action.payload;
    },
    clearSelectedStaff: (state) => {
      state.selectedStaff = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setStaffList,
  selectStaff,
  clearSelectedStaff,
  setLoading,
  setError,
} = staffSlice.actions;

export default staffSlice.reducer;
