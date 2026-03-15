import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Menu } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reports': 'Reports',
  '/inventory': 'Product Management',
  '/suppliers': 'Supplier Management',
  '/purchase-orders': 'Purchase Orders',
  '/supplier-bills': 'Supplier Bills',
  '/customer-bills': 'Customer Bills',
  '/users': 'User Management',
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2>{pageTitle}</h2>
          </div>
          <div className="top-header-right">
            <input
              type="text"
              className="header-search"
              placeholder="Search..."
            />
            <div className="header-notification">
              <Bell size={18} />
              <div className="notification-badge" />
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
