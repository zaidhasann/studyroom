import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';

// Components
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RoomPage from './pages/RoomPage';
import ProfilePage from './pages/ProfilePage';

import './styles/globals.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { toasts, removeToast } = useToast();

  return (
    <div>
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={loading}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={loading}>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={loading}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
