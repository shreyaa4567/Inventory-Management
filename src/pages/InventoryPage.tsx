import React, { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Edit2, Trash2, Search, Upload, MapPin, Calendar, Barcode } from 'lucide-react';

const categories = ['All', 'Groceries', 'Electronics', 'Stationery', 'Household Items', 'Clothing'];
const stockFilters = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
const statusClass: Record<string, string> = { 'In Stock': 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };

const InventoryPage: React.FC = () => {
  const { products, setProducts, suppliers, addMovement, addProducts, getStatus, currentUser } = useInventory();
  const [activeCategory, setActiveCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: '', category: 'Groceries', quantity: 0, price: 0, supplier: '', location: '', expiryDate: '', mfgDate: '', minStock: 10, imageUrl: '' });

  const filtered = products.filter(p => {
    const cat = activeCategory === 'All' || p.category === activeCategory;
    const stock = stockFilter === 'All' || p.status === stockFilter;
    const s = searchTerm.toLowerCase();
    const search = !s || p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s) || p.supplier.toLowerCase().includes(s) || p.barcode.toLowerCase().includes(s);
    return cat && stock && search;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', category: activeCategory === 'All' ? 'Groceries' : activeCategory, quantity: 0, price: 0, supplier: '', location: '', expiryDate: '', mfgDate: '', minStock: 10, imageUrl: '' });
    setShowModal(true);
  };

  const openEdit = (p: typeof products[0]) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category, quantity: p.quantity, price: p.price, supplier: p.supplier, location: p.location, expiryDate: p.expiryDate, mfgDate: p.mfgDate, minStock: p.minStock, imageUrl: p.imageUrl });
    setShowModal(true);
  };

  const handleSave = () => {
    const status = getStatus(form.quantity, form.minStock);
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...form, status } : p));
      addMovement({ productId: editingProduct.id, productName: form.name, action: 'Updated', quantityChange: form.quantity - editingProduct.quantity, date: new Date().toISOString().split('T')[0], user: currentUser.name });
    } else {
      const id = Date.now();
      const barcode = `${form.category.substring(0, 3).toUpperCase()}-${String(id).slice(-3)}-2024`;
      setProducts([...products, { id, ...form, status, barcode, avgDailySales: Math.max(1, Math.floor(Math.random() * 5)) }]);
      addMovement({ productId: id, productName: form.name, action: 'Added', quantityChange: form.quantity, date: new Date().toISOString().split('T')[0], user: currentUser.name });
    }
    setShowModal(false);
  };

  const handleDelete = (p: typeof products[0]) => {
    setProducts(products.filter(pr => pr.id !== p.id));
    addMovement({ productId: p.id, productName: p.name, action: 'Removed', quantityChange: -p.quantity, date: new Date().toISOString().split('T')[0], user: currentUser.name });
  };

  // CSV Import
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;
      const newProducts = lines.slice(1).map(line => {
        const [name, category, quantity, price, supplier] = line.split(',').map(s => s.trim());
        return {
          name, category: category || 'Groceries', quantity: parseInt(quantity) || 0, price: parseInt(price) || 0,
          supplier: supplier || '', location: '', expiryDate: '', mfgDate: '', barcode: `CSV-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          minStock: 10, imageUrl: '', avgDailySales: 1,
        };
      }).filter(p => p.name);
      addProducts(newProducts);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isExpiringSoon = (date: string) => {
    if (!date) return false;
    return (new Date(date).getTime() - Date.now()) / 86400000 <= 7;
  };

  const detailProduct = showDetailModal ? products.find(p => p.id === showDetailModal) : null;

  return (
    <div>
      {/* Category Tabs */}
      <div className="category-tabs fade-in-up">
        {categories.map(cat => (
          <button key={cat} className={`category-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat} <span style={{ marginLeft: 4, fontSize: '0.75rem', opacity: 0.6 }}>({cat === 'All' ? products.length : products.filter(p => p.category === cat).length})</span>
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="fade-in-up" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', animationDelay: '0.05s' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" className="header-search" placeholder="Search by name, category, supplier, barcode..." style={{ paddingLeft: '2.25rem', width: '100%' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} style={{ padding: '0.5rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.88rem', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
          {stockFilters.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value="" onChange={e => { if (e.target.value) setSearchTerm(e.target.value); }} style={{ padding: '0.5rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.88rem', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
          <option value="">Filter by Supplier</option>
          {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <input type="hidden" ref={fileRef as any} />
        <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
          <Upload size={16} /> Import CSV
          <input type="file" accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
        </label>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Product</button>
      </div>

      {/* Product Table */}
      <div className="content-card fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="content-card-header">
          <h3>Inventory ({filtered.length} items)</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}></th>
              <th>Product</th>
              <th>Category</th>
              <th>Location</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Supplier</th>
              <th>Expiry</th>
              <th>Barcode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ background: p.status === 'Low Stock' ? 'rgba(239,68,68,0.03)' : p.status === 'Out of Stock' ? 'rgba(239,68,68,0.06)' : undefined }}>
                <td>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f1f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.7rem' }}>IMG</div>
                  )}
                </td>
                <td style={{ fontWeight: 600, cursor: 'pointer', color: '#2563eb' }} onClick={() => setShowDetailModal(p.id)}>{p.name}</td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}><MapPin size={12} style={{ color: '#6b7280' }} />{p.location || '—'}</span></td>
                <td style={{ fontWeight: 600, color: p.quantity <= p.minStock && p.quantity > 0 ? '#dc2626' : undefined }}>{p.quantity}</td>
                <td>₹{p.price.toLocaleString()}</td>
                <td style={{ fontSize: '0.85rem' }}>{p.supplier}</td>
                <td>
                  {p.expiryDate ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: isExpiringSoon(p.expiryDate) ? '#dc2626' : '#6b7280', fontWeight: isExpiringSoon(p.expiryDate) ? 700 : 400 }}>
                      <Calendar size={12} />{p.expiryDate}
                    </span>
                  ) : '—'}
                </td>
                <td><span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#6b7280' }}>{p.barcode}</span></td>
                <td><span className={`badge ${statusClass[p.status]}`}>{p.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Product Name</label><input type="text" placeholder="e.g. Basmati Rice 5kg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '0.95rem', fontFamily: 'var(--font-sans)', background: '#fafafa' }}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Quantity</label><input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label>Price (₹)</label><input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="form-group"><label>Supplier</label><input type="text" placeholder="e.g. Sharma Traders" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Location (e.g. A-03-B)</label><input type="text" placeholder="A-03-B" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div className="form-group"><label>Min Stock Level</label><input type="number" min="0" value={form.minStock} onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Manufacture Date</label><input type="date" value={form.mfgDate} onChange={e => setForm({ ...form, mfgDate: e.target.value })} /></div>
                <div className="form-group"><label>Expiry Date</label><input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Image URL</label><input type="text" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingProduct ? 'Update' : 'Add'} Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal (Barcode) */}
      {detailProduct && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Product Details</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              {detailProduct.imageUrl && <img src={detailProduct.imageUrl} alt="" style={{ width: 120, height: 120, borderRadius: 16, objectFit: 'cover', margin: '0 auto 1rem' }} />}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{detailProduct.name}</h3>
              <span className={`badge ${statusClass[detailProduct.status]}`} style={{ marginBottom: '1rem', display: 'inline-flex' }}>{detailProduct.status}</span>
              {/* Barcode Display */}
              <div style={{ margin: '1rem auto', padding: '1rem', background: '#f9fafb', borderRadius: 12, maxWidth: 280 }}>
                <Barcode size={20} style={{ margin: '0 auto 0.5rem', display: 'block', color: '#374151' }} />
                <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, letterSpacing: 2, marginBottom: '0.25rem' }}>{detailProduct.barcode}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {detailProduct.barcode.split('').map((_, i) => (
                    <div key={i} style={{ width: Math.random() > 0.5 ? 2 : 1, height: 40, background: '#1e1e2d', borderRadius: 1 }} />
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'left', fontSize: '0.88rem', lineHeight: 2 }}>
                <div><strong>Category:</strong> {detailProduct.category}</div>
                <div><strong>Location:</strong> {detailProduct.location || '—'}</div>
                <div><strong>Quantity:</strong> {detailProduct.quantity} (Min: {detailProduct.minStock})</div>
                <div><strong>Price:</strong> ₹{detailProduct.price.toLocaleString()}</div>
                <div><strong>Supplier:</strong> {detailProduct.supplier}</div>
                {detailProduct.mfgDate && <div><strong>Mfg Date:</strong> {detailProduct.mfgDate}</div>}
                {detailProduct.expiryDate && <div><strong>Expiry:</strong> {detailProduct.expiryDate}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
