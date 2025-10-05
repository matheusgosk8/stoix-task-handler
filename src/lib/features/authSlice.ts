import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  username: string | null;
  token: string | null;
  id: string | null;

}

const initialState: AuthState = {
  username: null,
  token: null,
  id: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ username: string; token: string, id: string }>) {
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.id = action.payload.id;
    },
    logout(state) {
      state.username = null;
      state.token = null;
      state.id = null
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
