import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { SignUpView } from './components/auth/SignUpView';
import { AppShell } from './components/layout/AppShell';
import { Toast } from './components/common/Toast';

const MainContent: React.FC = () => {
  const { isAuthenticated, authView } = useApp();

  // If user clicked "Create New Account", immediately show SignUpView
  if (authView === 'signup') {
    return (
      <>
        <Toast />
        <SignUpView />
      </>
    );
  }

  // If user is not authenticated or explicitly in login view, show LoginView
  if (!isAuthenticated || authView === 'login') {
    return (
      <>
        <Toast />
        <LoginView />
      </>
    );
  }

  // Logged-in user in app
  return <AppShell />;
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
