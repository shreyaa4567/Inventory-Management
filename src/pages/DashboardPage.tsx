import React from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  Package, AlertTriangle, Truck, ShoppingCart, TrendingUp, TrendingDown,
  Clock, CheckCircle, XCircle, AlertCircle, CalendarClock, BarChart3, Zap, DollarSign, ArrowDownToLine, ArrowUpFromLine,
} from 'lucide-react';

const actionIcons: Record<string, React.ReactNode> = {
  Added: <TrendingUp size={14} style={{ color: '#22c55e' }} />,
  Sold: <TrendingDown size={14} style={{ color: '#ef4444' }} />,
  Updated: <AlertCircle size={14} style={{ color: '#f59e0b' }} />,
  Purchased: <CheckCircle size={14} style={{ color: '#3b82f6' }} />,
  Removed: <XCircle size={14} style={{ color: '#ef4444' }} />,
  Imported: <ArrowDownToLine size={14} style={{ color: '#3b82f6' }} />,
  Exported: <ArrowUpFromLine size={14} style={{ color: '#f97316' }} />,
};

const DashboardPage: React.FC = () => {
  const { products, suppliers, orders, movements, lowStockProducts, expiringProducts, stockForecasts, reorderSuggestions, setOrders } = useInventory();
  const totalProducts = products.reduce((s, p) => s + p.quantity, 0);
  const totalValue = products.reduce((s, p) => s + p.quantity * p.price, 0);

  const stats = [
    { label: 'Total Products', value: totalProducts.toLocaleString(), change: '+12.5%', dir: 'up', icon: Package },
    { label: 'Low Stock Items', value: String(lowStockProducts.length), change: lowStockProducts.length > 0 ? 'Alert' : 'OK', dir: lowStockProducts.length > 0 ? 'down' : 'up', icon: AlertTriangle },
    { label: 'Total Suppliers', value: String(suppliers.length), change: '+8.1%', dir: 'up', icon: Truck },
    { label: 'Total Orders', value: String(orders.length), change: '+18.2%', dir: 'up', icon: ShoppingCart },
    { label: 'Inventory Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, change: '+5.3%', dir: 'up', icon: DollarSign },
  ];

  const handleAutoReorder = (r: typeof reorderSuggestions[0]) => {
    const newOrder = {
      id: `PO-2024-${String(orders.length + 848).padStart(4, '0')}`,
      supplier: r.supplier,
      items: 1,
      total: `₹${(r.suggestedQty * r.product.price).toLocaleString()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending' as const,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <div>
      {/* Stat Cards */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-card-icon"><s.icon size={24} /></div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className={`stat-card-change ${s.dir}`}>
              {s.dir === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Expiry Alerts */}
        {expiringProducts.length > 0 && (
          <div className="content-card fade-in-up" style={{ animationDelay: '0.3s', borderLeft: '4px solid #f59e0b' }}>
            <div className="content-card-header">
              <h3><CalendarClock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: '#f59e0b' }} />Expiry Alerts</h3>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
              <p style={{ fontSize: '0.88rem', color: '#d97706', fontWeight: 600, marginBottom: '0.75rem' }}>
                ⚠️ {expiringProducts.length} product(s) expiring within 7 days
              </p>
              {expiringProducts.map(p => {
                const daysLeft = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f5f5f9', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span className="badge badge-danger">{daysLeft} day(s) left</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Forecast */}
        <div className="content-card fade-in-up" style={{ animationDelay: '0.35s', borderLeft: '4px solid #3b82f6' }}>
          <div className="content-card-header">
            <h3><BarChart3 size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: '#3b82f6' }} />Stock Forecast</h3>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {stockForecasts.slice(0, 5).map(f => (
              <div key={f.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid #f5f5f9', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600 }}>{f.product.name}</span>
                <span className={`badge ${f.daysRemaining <= 7 ? 'badge-danger' : f.daysRemaining <= 14 ? 'badge-warning' : 'badge-success'}`}>
                  ~{f.daysRemaining} days left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reorder Suggestions */}
      {reorderSuggestions.length > 0 && (
        <div className="content-card fade-in-up" style={{ animationDelay: '0.4s', marginBottom: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
          <div className="content-card-header">
            <h3><Zap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: '#8b5cf6' }} />Reorder Suggestions</h3>
          </div>
          <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
            {reorderSuggestions.map(r => (
              <div key={r.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f5f5f9', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{r.product.name}</span>
                  <span style={{ color: '#6b7280', marginLeft: 8 }}>Stock: {r.product.quantity} / Min: {r.product.minStock}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>Suggest: {r.suggestedQty} units from {r.supplier}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAutoReorder(r)}>Order Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movement History Timeline */}
      <div className="content-card fade-in-up" style={{ animationDelay: '0.45s', marginBottom: '1.5rem' }}>
        <div className="content-card-header">
          <h3><Clock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Product Movement History</h3>
        </div>
        <div style={{ padding: '1rem 1.5rem' }}>
          {movements.slice(0, 8).map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: '1px solid #f5f5f9' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {actionIcons[m.action]}
              </div>
              <div style={{ flex: 1, fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600 }}>{m.productName}</span>{' '}
                <span style={{ color: '#6b7280' }}>{m.action.toLowerCase()}</span>{' '}
                <span style={{ fontWeight: 700, color: m.quantityChange > 0 ? '#16a34a' : '#dc2626' }}>
                  ({m.quantityChange > 0 ? '+' : ''}{m.quantityChange})
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{m.date}</span>
              <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{m.user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
