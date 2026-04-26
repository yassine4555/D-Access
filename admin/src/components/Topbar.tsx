import React from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Platform overview at a glance' },
  '/users': { title: 'Users', subtitle: 'Manage registered users' },
  '/reports': { title: 'Reports', subtitle: 'Moderate accessibility reports' },
  '/marketplace': { title: 'Marketplace', subtitle: 'Manage products shown in the app' },
};

export const Topbar: React.FC = () => {
  const location = useLocation();
  const info = routeTitles[location.pathname] || { title: 'Admin', subtitle: 'Control Panel' };

  return (
    <header className="topbar">
      <div>
        <h1 className="page-title">{info.title}</h1>
        <div className="page-subtitle">{info.subtitle}</div>
      </div>
    </header>
  );
};
