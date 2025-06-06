import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  userId: null,
  userName: "",
  version: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.userId = action.payload.id;
      state.userName = action.payload.name;
      state.version = action.payload.version;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.userName = "";
      state.version = 0;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
