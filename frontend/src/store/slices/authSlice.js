import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  id: null,
  uid: null,
  userName: "",
  version: 0,
  role: "user",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.id = action.payload.id;
      state.uid = action.payload.uid;
      state.userName = action.payload.name;
      state.version = action.payload.version;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.id = null;
      state.uid = null;
      state.userName = "";
      state.version = 0;
      state.role = "user";
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
