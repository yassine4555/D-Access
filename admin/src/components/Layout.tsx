import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><span className="spinner"></span></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div id="app">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
