import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
// import anotherReducer from './anotherSlice'; // Import another reducer

const persistConfig = {
    key: 'root',
    storage,
};

// Combine reducers
const rootReducer = combineReducers({
    auth: persistReducer(persistConfig, authReducer),
    // another: anotherReducer,
});

export const store = configureStore({
    reducer: rootReducer, // Use combined reducer
});

export const persistor = persistStore(store); 