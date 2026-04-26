import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileWarning, Store, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <ShieldAlert className="brand-icon" style={{ color: 'var(--primary)' }} />
        <div>
          <div className="brand-name">D-Access</div>
          <div className="brand-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard className="nav-icon" /> Dashboard
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users className="nav-icon" /> Users
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileWarning className="nav-icon" /> Reports
        </NavLink>
        <NavLink to="/marketplace" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Store className="nav-icon" /> Marketplace
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="current-user">
          <div className="user-avatar">
            {getInitials(user?.firstName)}
          </div>
          <div>
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role-badge">{user?.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
