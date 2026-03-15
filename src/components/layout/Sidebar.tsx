import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Package, Truck, ShoppingCart, Users, LogOut, ChevronRight, Map, Route,
} from 'lucide-react';

interface SidebarProps { isOpen: boolean; onClose: () => void; }

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/inventory', label: 'Product', icon: Package },
  { to: '/suppliers', label: 'Supplier', icon: Truck },
  { to: '/purchase-orders', label: 'Purchase Order', icon: ShoppingCart },
  { to: '/users', label: 'User', icon: Users },
  { to: '/warehouse-map', label: 'Warehouse Map', icon: Map },
  { to: '/pick-route', label: 'Pick Route', icon: Route },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">IMS</div>
            <span>IMS</span>
          </div>
          <div className="sidebar-profile">
            <div className="sidebar-avatar">JD</div>
            <div className="sidebar-profile-info">
              <h4>John Doe</h4>
              <span>Administrator</span>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={`sidebar-nav-item ${location.pathname === item.to ? 'active' : ''}`} onClick={onClose}>
              <item.icon size={20} className="nav-icon" />
              <span>{item.label}</span>
              {location.pathname === item.to && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </NavLink>
          ))}
          <div className="sidebar-nav-label" style={{ marginTop: '1.5rem' }}>Settings</div>
          <div className="sidebar-nav-item" style={{ cursor: 'pointer' }} onClick={() => { window.location.href = '/'; }}>
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
