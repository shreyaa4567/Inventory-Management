import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { AlertTriangle, Package, DollarSign, BarChart3 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { products, lowStockProducts } = useInventory();

  const totalProducts = products.reduce((s, p) => s + p.quantity, 0);
  const totalValue = products.reduce((s, p) => s + p.quantity * p.price, 0);
  const categories = [...new Set(products.map(p => p.category))];
  const outOfStock = products.filter(p => p.status === 'Out of Stock').length;

  const categoryData = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    return { name: cat, count: catProducts.length, qty: catProducts.reduce((s, p) => s + p.quantity, 0), value: catProducts.reduce((s, p) => s + p.quantity * p.price, 0) };
  });

  const maxQty = Math.max(...categoryData.map(c => c.qty));
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div>
      {/* Summary Cards */}
      <div className="stats-grid fade-in-up" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.25rem' }}>
        <div className="stat-card"><div className="stat-card-icon"><Package size={24} /></div><div className="stat-card-value">{totalProducts.toLocaleString()}</div><div className="stat-card-label">Total Units</div></div>
        <div className="stat-card"><div className="stat-card-icon"><DollarSign size={24} /></div><div className="stat-card-value">₹{(totalValue / 100000).toFixed(1)}L</div><div className="stat-card-label">Inventory Value</div></div>
        <div className="stat-card"><div className="stat-card-icon"><BarChart3 size={24} /></div><div className="stat-card-value">{categories.length}</div><div className="stat-card-label">Categories</div></div>
        <div className="stat-card"><div className="stat-card-icon"><AlertTriangle size={24} /></div><div className="stat-card-value">{outOfStock}</div><div className="stat-card-label">Out of Stock</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Bar Chart */}
        <div className="content-card fade-in-up" style={{ padding: '1.5rem', animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Stock by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categoryData.map((c, i) => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: '#6b7280' }}>{c.qty} units</span>
                </div>
                <div style={{ height: 20, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.qty / maxQty) * 100}%`, height: '100%', background: colors[i % colors.length], borderRadius: 10, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="content-card fade-in-up" style={{ padding: '1.5rem', animationDelay: '0.15s' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Value by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categoryData.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: colors[i % colors.length] }} />
                <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{c.count} items</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>₹{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="content-card fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="content-card-header"><h3>Low Stock Report ({lowStockProducts.length} items)</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Min Stock</th><th>Supplier</th><th>Status</th></tr>
          </thead>
          <tbody>
            {lowStockProducts.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td style={{ fontWeight: 700, color: '#dc2626' }}>{p.quantity}</td>
                <td>{p.minStock}</td>
                <td>{p.supplier}</td>
                <td><span className="badge badge-warning">Low Stock</span></td>
              </tr>
            ))}
            {products.filter(p => p.status === 'Out of Stock').map(p => (
              <tr key={p.id} style={{ background: 'rgba(239,68,68,0.05)' }}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td style={{ fontWeight: 700, color: '#dc2626' }}>0</td>
                <td>{p.minStock}</td>
                <td>{p.supplier}</td>
                <td><span className="badge badge-danger">Out of Stock</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
