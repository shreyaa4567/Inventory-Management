import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { ShoppingCart, Truck, Clock, CheckCircle } from 'lucide-react';

const statusBadge: Record<string, string> = {
  Delivered: 'badge-success',
  'In Transit': 'badge-info',
  Pending: 'badge-warning',
  Cancelled: 'badge-danger',
};

const PurchaseOrderPage: React.FC = () => {
  const { orders } = useInventory();

  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const pending = orders.filter(o => o.status === 'Pending').length;
  const inTransit = orders.filter(o => o.status === 'In Transit').length;

  return (
    <div>
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

      <div className="content-card fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="content-card-header"><h3>Purchase Orders ({orders.length})</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Order ID</th><th>Supplier</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderPage;
