import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import EmployeeIndex from './pages/employees/EmployeeIndex';
import FinancialDashboard from './pages/financial/FinancialDashboard';
import LegalDocumentManager from './pages/legal/LegalDocumentManager';
import SecurityIDManager from './pages/security/SecurityIDManager';
import VehicleManager from './pages/vehicles/VehicleManager';
import MedicalRecordsDashboard from './pages/medical/MedicalRecordsDashboard';
import EnvironmentalSafetyDashboard from './pages/environmental/EnvironmentalSafetyDashboard';
import PerformanceBoardDashboard from './pages/performance/PerformanceBoardDashboard';
import BackupManagementDashboard from './pages/backup/BackupManagementDashboard';

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token) || localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeIndex />} />
        <Route path="/financial" element={<FinancialDashboard />} />
        <Route path="/legal" element={<LegalDocumentManager />} />
        <Route path="/security" element={<SecurityIDManager />} />
        <Route path="/vehicles" element={<VehicleManager />} />
        <Route path="/medical" element={<MedicalRecordsDashboard />} />
        <Route path="/environmental" element={<EnvironmentalSafetyDashboard />} />
        <Route path="/performance" element={<PerformanceBoardDashboard />} />
        <Route path="/backup" element={<BackupManagementDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
