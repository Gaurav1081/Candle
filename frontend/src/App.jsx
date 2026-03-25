// App.jsx  (updated — wraps app with NotificationProvider)
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext'; // ← NEW
import AuthGate from './auth/AuthGate';
import LoadingScreen from './auth/LoadingScreen';
import AppLayout from './layout/AppLayout';
import './App.css';

function MainApp() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthGate />;

  // NotificationProvider is inside AuthProvider so it can read isAuthenticated
  return (
    <NotificationProvider>
      <AppLayout />
    </NotificationProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;