import { configureStore, createSlice } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const makeSlice = (name) => {
  return createSlice({
    name,
    initialState: { items: [], loading: false, error: null },
    reducers: {
      setLoading: (state, action) => { state.loading = action.payload; },
      setItems: (state, action) => { state.items = action.payload; },
      setError: (state, action) => { state.error = action.payload; },
    },
  }).reducer;
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: makeSlice('employees'),
    financial: makeSlice('financial'),
    legal: makeSlice('legal'),
    security: makeSlice('security'),
    vehicles: makeSlice('vehicles'),
    medical: makeSlice('medical'),
    environmental: makeSlice('environmental'),
    performance: makeSlice('performance'),
    backup: makeSlice('backup'),
    notifications: makeSlice('notifications'),
  },
});

export default store;
