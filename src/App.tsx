import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { SignUpView } from './components/auth/SignUpView';
import { AppShell } from './components/layout/AppShell';
import { Toast } from './components/common/Toast';

const MainContent: React.FC = () => {
  const { isAuthenticated, authView, currentUser } = useApp();

  // If user clicked "Create New Account", immediately show SignUpView
  if (authView === 'signup') {
    return (
      <>
        <Toast />
        <SignUpView />
      </>
    );
  }

  // Pending / rejected marketers never enter the workspace
  const canUseApp =
    isAuthenticated &&
    authView === 'app' &&
    currentUser &&
    (currentUser.role === 'Admin' || currentUser.approvalStatus === 'approved');

  if (!canUseApp) {
    return (
      <>
        <Toast />
        <LoginView />
      </>
    );
  }

  return <AppShell />;
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
