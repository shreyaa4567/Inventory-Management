import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Plus, Edit2, Trash2, Star, Truck, CheckCircle } from 'lucide-react';

const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<typeof suppliers[0] | null>(null);
  const [form, setForm] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '', totalOrders: 0, onTimeDeliveries: 0, rating: 4 });

  const filtered = suppliers.filter(s => {
    const q = searchTerm.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const totalOrders = suppliers.reduce((s, sup) => s + sup.totalOrders, 0);
  const avgRating = (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1);
  const avgOnTime = (suppliers.reduce((s, sup) => s + (sup.onTimeDeliveries / sup.totalOrders) * 100, 0) / suppliers.length).toFixed(0);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', contactPerson: '', phone: '', email: '', address: '', totalOrders: 0, onTimeDeliveries: 0, rating: 4 });
    setShowModal(true);
  };

  const openEdit = (s: typeof suppliers[0]) => {
    setEditing(s);
    setForm({ name: s.name, contactPerson: s.contactPerson, phone: s.phone, email: s.email, address: s.address, totalOrders: s.totalOrders, onTimeDeliveries: s.onTimeDeliveries, rating: s.rating });
    setShowModal(true);
  };

  const save = async () => {
    if (editing) {
      await updateSupplier(editing.id, { ...form });
    } else {
      await addSupplier({ ...form });
    }
    setShowModal(false);
  };

  const remove = async (id: number) => await deleteSupplier(id);

  const renderStars = (rating: number) => (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} color={i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} />
      ))}
      <span style={{ marginLeft: 4, fontSize: '0.82rem', color: '#6b7280' }}>{rating.toFixed(1)}</span>
    </span>
  );

  return (
    <div>
      {/* Performance Stats */}
      <div className="stats-grid fade-in-up" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.25rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><Truck size={24} /></div>
          <div className="stat-card-value">{totalOrders.toLocaleString()}</div>
          <div className="stat-card-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><CheckCircle size={24} /></div>
          <div className="stat-card-value">{avgOnTime}%</div>
          <div className="stat-card-label">Avg On-Time Delivery</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><Star size={24} /></div>
          <div className="stat-card-value">{avgRating}</div>
          <div className="stat-card-label">Avg Rating</div>
        </div>
      </div>

      {/* Search + Add */}
      <div className="fade-in-up" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', animationDelay: '0.05s' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" className="header-search" placeholder="Search suppliers..." style={{ paddingLeft: '2.25rem', width: '100%' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Supplier</button>
      </div>

      {/* Table */}
      <div className="content-card fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="content-card-header"><h3>Suppliers ({filtered.length})</h3></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Total Orders</th>
              <th>On-Time %</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.contactPerson}</td>
                <td>{s.phone}</td>
                <td style={{ color: '#2563eb' }}>{s.email}</td>
                <td style={{ fontWeight: 600 }}>{s.totalOrders}</td>
                <td>
                  {(() => {
                    const pct = s.onTimeDeliveryPercent ?? (s.totalOrders > 0 ? ((s.onTimeDeliveries / s.totalOrders) * 100) : 0);
                    return (
                      <span className={`badge ${pct >= 95 ? 'badge-success' : pct >= 85 ? 'badge-warning' : 'badge-danger'}`}>
                        {pct.toFixed(0)}%
                      </span>
                    );
                  })()}
                </td>
                <td>{renderStars(s.rating)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}><Edit2 size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(s.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit' : 'Add'} Supplier</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Supplier Name</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Contact Person</label><input type="text" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Phone</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Address</label><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Total Orders</label><input type="number" min="0" value={form.totalOrders} onChange={e => setForm({ ...form, totalOrders: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label>On-Time Deliveries</label><input type="number" min="0" value={form.onTimeDeliveries} onChange={e => setForm({ ...form, onTimeDeliveries: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) || 4 })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
