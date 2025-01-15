import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CacheData {
  data: any;
  timestamp: number;
  totalPages?: number;
  count?: number;
}

interface CacheState {
  [key: string]: CacheData;
}

// Cache durations in milliseconds
export const CACHE_DURATIONS = {
  DOCTORS: 5 * 60 * 1000,    // 5 minutes
  USERS: 10 * 60 * 1000,     // 10 minutes
  CONSULTATIONS: 2 * 60 * 1000  // 2 minutes (more frequent updates)
};

const initialState: CacheState = {};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setCacheData: (
      state,
      action: PayloadAction<{ 
        key: string; 
        data: any; 
        totalPages?: number;
        count?: number;
      }>
    ) => {
      state[action.payload.key] = {
        data: action.payload.data,
        timestamp: Date.now(),
        totalPages: action.payload.totalPages,
        count: action.payload.count
      };
    },
    clearCache: () => {
      return initialState;
    },
    clearCacheByPrefix: (state, action: PayloadAction<string>) => {
      Object.keys(state).forEach(key => {
        if (key.startsWith(action.payload)) {
          delete state[key];
        }
      });
    },
  },
});

export const { setCacheData, clearCache, clearCacheByPrefix } = cacheSlice.actions;

export const selectCacheData = (
  state: { cache: CacheState }, 
  key: string,
  cacheDuration: number
) => {
  const cached = state.cache[key];
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cacheDuration) {
    return null;
  }
  
  return cached;
};

export default cacheSlice.reducer; 