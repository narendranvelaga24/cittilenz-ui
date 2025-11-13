import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "official" | "admin";
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isJwtExpired: boolean;
  isJwtSignatureException: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  isJwtExpired: false,
  isJwtSignatureException: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoggedIn = true;
      state.user = action.payload;
      state.isJwtExpired = false;
      state.isJwtSignatureException = false;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.isJwtExpired = false;
      state.isJwtSignatureException = false;
    },
    setJwtExpired: (state) => {
      state.isJwtExpired = true;
    },
    resetJwtExpired: (state) => {
      state.isJwtExpired = false;
    },
    setJwtSignatureException: (state) => {
      state.isJwtSignatureException = true;
    },
  },
});

export const {
  loginSuccess,
  logout,
  setJwtExpired,
  resetJwtExpired,
  setJwtSignatureException,
} = authSlice.actions;

export default authSlice.reducer;
