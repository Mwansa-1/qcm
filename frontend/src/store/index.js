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
  });
};

const employeesSlice = makeSlice('employees');
const financialSlice = makeSlice('financial');
const legalSlice = makeSlice('legal');
const securitySlice = makeSlice('security');
const vehiclesSlice = makeSlice('vehicles');
const medicalSlice = makeSlice('medical');
const environmentalSlice = makeSlice('environmental');
const performanceSlice = makeSlice('performance');
const backupSlice = makeSlice('backup');
const notificationsSlice = makeSlice('notifications');

export const { setLoading: setEmployeesLoading, setItems: setEmployeesItems, setError: setEmployeesError } = employeesSlice.actions;
export const { setLoading: setFinancialLoading, setItems: setFinancialItems, setError: setFinancialError } = financialSlice.actions;
export const { setLoading: setLegalLoading, setItems: setLegalItems, setError: setLegalError } = legalSlice.actions;
export const { setLoading: setSecurityLoading, setItems: setSecurityItems, setError: setSecurityError } = securitySlice.actions;
export const { setLoading: setVehiclesLoading, setItems: setVehiclesItems, setError: setVehiclesError } = vehiclesSlice.actions;
export const { setLoading: setMedicalLoading, setItems: setMedicalItems, setError: setMedicalError } = medicalSlice.actions;
export const { setLoading: setEnvironmentalLoading, setItems: setEnvironmentalItems, setError: setEnvironmentalError } = environmentalSlice.actions;
export const { setLoading: setPerformanceLoading, setItems: setPerformanceItems, setError: setPerformanceError } = performanceSlice.actions;
export const { setLoading: setBackupLoading, setItems: setBackupItems, setError: setBackupError } = backupSlice.actions;
export const { setLoading: setNotificationsLoading, setItems: setNotificationsItems, setError: setNotificationsError } = notificationsSlice.actions;

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesSlice.reducer,
    financial: financialSlice.reducer,
    legal: legalSlice.reducer,
    security: securitySlice.reducer,
    vehicles: vehiclesSlice.reducer,
    medical: medicalSlice.reducer,
    environmental: environmentalSlice.reducer,
    performance: performanceSlice.reducer,
    backup: backupSlice.reducer,
    notifications: notificationsSlice.reducer,
  },
});

export default store;
