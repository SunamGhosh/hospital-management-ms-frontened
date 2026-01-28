import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiFileText,
  FiMenu,
  FiX,
  FiLogOut,
  FiShield,
} from 'react-icons/fi';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getMenuItems = () => {
    const role = user?.role;
    const baseItems = [
      { path: '/app/dashboard', icon: FiHome, label: 'Dashboard' },
    ];

    if (role === 'admin') {
      return [
        ...baseItems,
        { path: '/app/patients', icon: FiUsers, label: 'Patients' },
        { path: '/app/doctors', icon: FiUserCheck, label: 'Doctors' },
        { path: '/app/appointments', icon: FiCalendar, label: 'Appointments' },
        { path: '/app/medical-records', icon: FiFileText, label: 'Medical Records' },
        { path: '/app/admins', icon: FiShield, label: 'Admins' },
      ];
    } else if (role === 'doctor') {
      return [
        ...baseItems,
        { path: '/app/appointments', icon: FiCalendar, label: 'My Appointments' },
        { path: '/app/medical-records', icon: FiFileText, label: 'Medical Records' },
        { path: '/app/patients', icon: FiUsers, label: 'My Patients' },
      ];
    } else if (role === 'customer') {
      return [
        ...baseItems,
        { path: '/app/appointments', icon: FiCalendar, label: 'My Appointments' },
        { path: '/app/medical-records', icon: FiFileText, label: 'My Records' },
        { path: '/app/book-appointment', icon: FiCalendar, label: 'Book Appointment' },
      ];
    }
    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Hospital MS</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            {sidebarOpen && (
              <div className="user-details">
                <div className="user-name">{user?.username}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={logout}>
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

