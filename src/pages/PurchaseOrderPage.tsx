import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { ShoppingCart, Truck, Clock, CheckCircle, Plus, Save, X, Calendar } from 'lucide-react';

const statusBadge: Record<string, string> = {
  Delivered: 'badge-success',
  'In Transit': 'badge-info',
  Pending: 'badge-warning',
  Cancelled: 'badge-danger',
};

const PurchaseOrderPage: React.FC = () => {
  const { products, suppliers, orders, setOrders, addNotification, updateOrderStatus } = useInventory();
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ supplierId: '', productId: '', quantity: '' });

  useEffect(() => {
    if (location.state?.createOrder && location.state?.prefill) {
      setShowForm(true);
      const prefill = location.state.prefill;
      const supplier = suppliers.find(s => s.name === prefill.supplier);
      setFormData({
        supplierId: supplier ? String(supplier.id) : '',
        productId: String(prefill.product.id),
        quantity: String(prefill.suggestedQty)
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location, suppliers, navigate]);

  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const pending = orders.filter(o => o.status === 'Pending').length;
  const inTransit = orders.filter(o => o.status === 'In Transit').length;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.productId || !formData.quantity) return;

    const supplier = suppliers.find(s => s.id === Number(formData.supplierId));
    const product = products.find(p => p.id === Number(formData.productId));
    if (!supplier || !product) return;

    const qty = Number(formData.quantity);
    const totalValue = qty * product.price;

    const newOrder = {
      id: `PO-${new Date().getFullYear()}-${String(orders.length + 848).padStart(4, '0')}`,
      supplier: supplier.name,
      items: qty,
      total: `₹${totalValue.toLocaleString()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending' as const,
      orderItems: [{
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: product.price,
        total: totalValue
      }]
    };

    setOrders(prev => [newOrder, ...prev]);
    addNotification(`Purchase order ${newOrder.id} generated for ${product.name}`, 'info');
    setShowForm(false);
    setFormData({ supplierId: '', productId: '', quantity: '' });
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateOrderStatus(id, newStatus);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1e2d' }}>Purchase Orders</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Purchase Order
          </button>
        )}
      </div>

      <div className="stats-grid fade-in-up" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.25rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><ShoppingCart size={24} /></div>
          <div className="stat-card-value">{orders.length}</div>
          <div className="stat-card-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><CheckCircle size={24} /></div>
          <div className="stat-card-value">{delivered}</div>
          <div className="stat-card-label">Delivered</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><Truck size={24} /></div>
          <div className="stat-card-value">{inTransit}</div>
          <div className="stat-card-label">In Transit</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><Clock size={24} /></div>
          <div className="stat-card-value">{pending}</div>
          <div className="stat-card-label">Pending</div>
        </div>
      </div>

      {showForm && (
        <div className="content-card fade-in-up" style={{ marginBottom: '1.5rem' }}>
          <div className="content-card-header" style={{ background: '#f8fafc' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={18} /> Create Purchase Order</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /> Cancel</button>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <form onSubmit={handleCreateOrder}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Supplier</label>
                  <select
                    value={formData.supplierId}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fafafa' }}
                    required
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type="text" value={new Date().toLocaleDateString()} readOnly style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2rem', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f3f4f6', color: '#6b7280' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '1rem' }}>Order Item</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Product</label>
                    <select
                      value={formData.productId}
                      onChange={e => setFormData({ ...formData, productId: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff' }}
                      required
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff' }}
                      required
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Save Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-card fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="content-card-header"><h3>Purchase Orders ({orders.length})</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Order ID</th><th>Supplier</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{o.id}</td>
                <td>{o.supplier}</td>
                <td>{o.items}</td>
                <td style={{ fontWeight: 600 }}>{o.total}</td>
                <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{o.date}</td>
                <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span></td>
                <td>
                  <select 
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    disabled={o.status === 'Delivered' || o.status === 'Cancelled'}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem', background: '#f8fafc', cursor: o.status === 'Delivered' || o.status === 'Cancelled' ? 'not-allowed' : 'pointer', opacity: o.status === 'Delivered' || o.status === 'Cancelled' ? 0.5 : 1 }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderPage;
