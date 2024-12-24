import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: any | null; // Define user type as needed
}

const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any}>) => {
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.user = null;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; 