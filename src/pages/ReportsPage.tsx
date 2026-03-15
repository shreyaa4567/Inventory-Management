import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { AlertTriangle, Package, DollarSign, BarChart3, TrendingUp, TrendingDown, ShoppingCart, Truck } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { products, lowStockProducts, supplierBills, customerBills } = useInventory();

  const totalProducts = products.reduce((s, p) => s + p.quantity, 0);
  const totalValue = products.reduce((s, p) => s + p.quantity * p.price, 0);
  const categories = [...new Set(products.map(p => p.category))];
  const outOfStock = products.filter(p => p.status === 'Out of Stock').length;

  // Billing aggregates
  const totalPurchaseValue = supplierBills.reduce((s, b) => s + b.grandTotal, 0);
  const totalSalesValue = customerBills.reduce((s, b) => s + b.grandTotal, 0);

  // Top selling products (from customer bills)
  const soldMap = new Map<number, { name: string; qty: number; value: number }>();
  customerBills.forEach(b => b.items.forEach(it => {
    const existing = soldMap.get(it.productId) || { name: it.productName, qty: 0, value: 0 };
    soldMap.set(it.productId, { name: it.productName, qty: existing.qty + it.quantity, value: existing.value + it.total });
  }));
  const topSelling = [...soldMap.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);

  // Most purchased products (from supplier bills)
  const purchasedMap = new Map<number, { name: string; qty: number; value: number }>();
  supplierBills.forEach(b => b.items.forEach(it => {
    const existing = purchasedMap.get(it.productId) || { name: it.productName, qty: 0, value: 0 };
    purchasedMap.set(it.productId, { name: it.productName, qty: existing.qty + it.quantity, value: existing.value + it.total });
  }));
  const mostPurchased = [...purchasedMap.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);

  const categoryData = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    return { name: cat, count: catProducts.length, qty: catProducts.reduce((s, p) => s + p.quantity, 0), value: catProducts.reduce((s, p) => s + p.quantity * p.price, 0) };
  });

  const maxQty = Math.max(...categoryData.map(c => c.qty));
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div>
      {/* Inventory Summary Cards */}
      <div className="stats-grid fade-in-up" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.25rem' }}>
        <div className="stat-card"><div className="stat-card-icon"><Package size={24} /></div><div className="stat-card-value">{totalProducts.toLocaleString()}</div><div className="stat-card-label">Total Units</div></div>
        <div className="stat-card"><div className="stat-card-icon"><DollarSign size={24} /></div><div className="stat-card-value">₹{(totalValue / 100000).toFixed(1)}L</div><div className="stat-card-label">Inventory Value</div></div>
        <div className="stat-card"><div className="stat-card-icon"><BarChart3 size={24} /></div><div className="stat-card-value">{categories.length}</div><div className="stat-card-label">Categories</div></div>
        <div className="stat-card"><div className="stat-card-icon"><AlertTriangle size={24} /></div><div className="stat-card-value">{outOfStock}</div><div className="stat-card-label">Out of Stock</div></div>
      </div>

      {/* Billing Summary Cards */}
      <div className="stats-grid fade-in-up" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.25rem', animationDelay: '0.05s' }}>
        <div className="stat-card"><div className="stat-card-icon"><Truck size={24} /></div><div className="stat-card-value">₹{totalPurchaseValue.toLocaleString()}</div><div className="stat-card-label">Total Purchase Value</div></div>
        <div className="stat-card"><div className="stat-card-icon"><ShoppingCart size={24} /></div><div className="stat-card-value">₹{totalSalesValue.toLocaleString()}</div><div className="stat-card-label">Total Sales Value</div></div>
        <div className="stat-card"><div className="stat-card-icon"><TrendingUp size={24} /></div><div className="stat-card-value">{topSelling.length}</div><div className="stat-card-label">Top Selling Products</div></div>
        <div className="stat-card"><div className="stat-card-icon"><TrendingDown size={24} /></div><div className="stat-card-value">{mostPurchased.length}</div><div className="stat-card-label">Most Purchased Products</div></div>
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

      {/* Top Selling and Most Purchased Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="content-card fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="content-card-header"><h3>Top Selling Products</h3></div>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {topSelling.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af' }}>No sales data yet</td></tr>
              ) : topSelling.map(([id, data]) => (
                <tr key={id}>
                  <td style={{ fontWeight: 600 }}>{data.name}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{data.qty}</td>
                  <td>₹{data.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="content-card fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="content-card-header"><h3>Most Purchased Products</h3></div>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Units Purchased</th><th>Cost</th></tr></thead>
            <tbody>
              {mostPurchased.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af' }}>No purchase data yet</td></tr>
              ) : mostPurchased.map(([id, data]) => (
                <tr key={id}>
                  <td style={{ fontWeight: 600 }}>{data.name}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{data.qty}</td>
                  <td>₹{data.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="content-card fade-in-up" style={{ animationDelay: '0.3s' }}>
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

