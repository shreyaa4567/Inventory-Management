import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Menu, Search, Package, Truck, ShoppingCart, MapPin, Users, X, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reports': 'Reports',
  '/inventory': 'Product Management',
  '/suppliers': 'Supplier Management',
  '/purchase-orders': 'Purchase Orders',
  '/supplier-bills': 'Supplier Bills',
  '/customer-bills': 'Customer Bills',
  '/users': 'User Management',
  '/warehouse-map': 'Warehouse Map',
  '/pick-route': 'Pick Route',
};

interface SearchResult {
  type: 'Product' | 'Supplier' | 'Order' | 'Location' | 'User';
  name: string;
  route: string;
  icon: React.ReactNode;
}

const notifIcon: Record<string, React.ReactNode> = {
  info: <Info size={14} style={{ color: '#3b82f6' }} />,
  warning: <AlertTriangle size={14} style={{ color: '#f59e0b' }} />,
  success: <CheckCircle size={14} style={{ color: '#22c55e' }} />,
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { products, suppliers, orders, users, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useInventory();
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search results
  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    const results: SearchResult[] = [];
    // Products
    products.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q)) {
        results.push({ type: 'Product', name: p.name, route: '/inventory', icon: <Package size={14} style={{ color: '#3b82f6' }} /> });
      }
    });
    // Suppliers
    suppliers.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) {
        results.push({ type: 'Supplier', name: s.name, route: '/suppliers', icon: <Truck size={14} style={{ color: '#22c55e' }} /> });
      }
    });
    // Purchase Orders
    orders.forEach(o => {
      if (o.id.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q)) {
        results.push({ type: 'Order', name: o.id, route: '/purchase-orders', icon: <ShoppingCart size={14} style={{ color: '#8b5cf6' }} /> });
      }
    });
    // Warehouse Locations
    const locSet = new Set<string>();
    products.forEach(p => {
      if (p.location && p.location.toLowerCase().includes(q) && !locSet.has(p.location)) {
        locSet.add(p.location);
        results.push({ type: 'Location', name: p.location, route: '/warehouse-map', icon: <MapPin size={14} style={{ color: '#f59e0b' }} /> });
      }
    });
    // Users
    users.forEach(u => {
      if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
        results.push({ type: 'User', name: u.name, route: '/users', icon: <Users size={14} style={{ color: '#6b7280' }} /> });
      }
    });
    return results.slice(0, 12);
  }, [searchQuery, products, suppliers, orders, users]);

  const handleResultClick = (r: SearchResult) => {
    navigate(r.route);
    setSearchQuery('');
    setShowSearch(false);
  };

  const formatTime = (ts: string) => {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2>{pageTitle}</h2>
          </div>
          <div className="top-header-right">
            {/* Search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="header-search"
                  placeholder="Search products, suppliers, orders..."
                  style={{ paddingLeft: '2.1rem' }}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                  onFocus={() => { if (searchQuery) setShowSearch(true); }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              {showSearch && searchQuery && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 380, maxHeight: 400, overflowY: 'auto',
                  background: '#fff', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                  zIndex: 100, animation: 'fadeIn 0.15s ease',
                }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
                      No results for "{searchQuery}"
                    </div>
                  ) : (
                    <div style={{ padding: '0.5rem' }}>
                      <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9ca3af' }}>
                        {searchResults.length} result(s)
                      </div>
                      {searchResults.map((r, i) => (
                        <div
                          key={`${r.type}-${r.name}-${i}`}
                          onClick={() => handleResultClick(r)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem',
                            borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f9')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {r.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e1e2d' }}>{r.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{r.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <div
                className="header-notification"
                onClick={() => setShowNotifs(!showNotifs)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
                    background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
                    padding: '0 4px',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              {showNotifs && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 380, maxHeight: 440, overflowY: 'auto',
                  background: '#fff', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                  zIndex: 100, animation: 'fadeIn 0.15s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f1f5' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e1e2d' }}>
                      Notifications {unreadCount > 0 && <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>({unreadCount} new)</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsRead} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ padding: '0.25rem' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>No notifications</div>
                    ) : (
                      notifications.slice(0, 20).map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem',
                            borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
                            background: n.read ? 'transparent' : 'rgba(59,130,246,0.04)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f9')}
                          onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(59,130,246,0.04)')}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            {notifIcon[n.type]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>
                              {formatTime(n.timestamp)}
                            </div>
                          </div>
                          {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 8 }} />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
