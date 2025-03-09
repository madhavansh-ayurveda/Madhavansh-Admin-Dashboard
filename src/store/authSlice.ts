import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  user: any | null; // Define user type as needed
  token: string | null; // Add token to the state
}

const initialState: AuthState = {
  user: null,
  token: null, // Initialize token as null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token; // Save token to state
    },
    logout: (state) => {
      state.user = null;
      state.token = null; // Clear token on logout
      // localStorage.removeItem("authToken");
      // localStorage.removeItem("adminToken"); 
      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("authorization");
      localStorage.removeItem("role");
      localStorage.removeItem("permissions");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
