import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Trash2, FileText, Save, X, AlertTriangle } from 'lucide-react';

interface LineItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

const CustomerBillsPage: React.FC = () => {
  const { products, customerBills, addCustomerBill } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ productId: 0, productName: '', quantity: 0, price: 0 }]);
  const [error, setError] = useState('');

  const addLineItem = () => setLineItems([...lineItems, { productId: 0, productName: '', quantity: 0, price: 0 }]);

  const removeLineItem = (idx: number) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'productId') {
        const product = products.find(p => p.id === Number(value));
        return { ...item, productId: Number(value), productName: product?.name || '', price: product?.price || 0 };
      }
      return { ...item, [field]: typeof value === 'string' ? (Number(value) || 0) : value };
    }));
    setError('');
  };

  const grandTotal = lineItems.reduce((s, it) => s + it.quantity * it.price, 0);

  const handleSave = () => {
    if (!customerName.trim() || lineItems.some(it => !it.productId || it.quantity <= 0)) return;
    const result = addCustomerBill(
      customerName.trim(),
      lineItems.map(it => ({ productId: it.productId, productName: it.productName, quantity: it.quantity, price: it.price }))
    );
    if (!result.success) {
      setError(result.error || 'Not enough inventory available.');
      return;
    }
    setShowForm(false);
    setCustomerName('');
    setLineItems([{ productId: 0, productName: '', quantity: 0, price: 0 }]);
    setError('');
  };

  const resetForm = () => {
    setShowForm(false);
    setCustomerName('');
    setLineItems([{ productId: 0, productName: '', quantity: 0, price: 0 }]);
    setError('');
  };

  // Get available stock for a product
  const getAvailableStock = (productId: number) => {
    const p = products.find(pr => pr.id === productId);
    return p ? p.quantity : 0;
  };

  return (
    <div>
      {/* Header */}
      <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Customer Bills (Export Stock)</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 2 }}>Generate invoices when products leave the warehouse</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Customer Bill
        </button>
      </div>

      {/* Create Bill Form */}
      {showForm && (
        <div className="content-card fade-in-up" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #22c55e' }}>
          <div className="content-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3><FileText size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: '#22c55e' }} />New Customer Bill</h3>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={16} /></button>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {/* Error Display */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#dc2626', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            {/* Customer Name */}
            <div className="form-group" style={{ maxWidth: 400, marginBottom: '1.25rem' }}>
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Line Items */}
            <table className="data-table" style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Product</th>
                  <th>Available</th>
                  <th>Quantity</th>
                  <th>Price (₹)</th>
                  <th>Total (₹)</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const available = getAvailableStock(item.productId);
                  const overStock = item.productId > 0 && item.quantity > available;
                  return (
                    <tr key={idx} style={{ background: overStock ? 'rgba(239,68,68,0.05)' : undefined }}>
                      <td>
                        <select
                          value={item.productId || ''}
                          onChange={e => updateLineItem(idx, 'productId', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: '#fafafa' }}
                        >
                          <option value="">Select Product...</option>
                          {products.filter(p => p.quantity > 0).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${available <= 0 ? 'badge-danger' : available <= 10 ? 'badge-warning' : 'badge-success'}`}>
                          {item.productId ? available : '—'}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number" min="1" value={item.quantity || ''}
                          onChange={e => updateLineItem(idx, 'quantity', e.target.value)}
                          style={{
                            width: 80, padding: '0.5rem', border: `1.5px solid ${overStock ? '#ef4444' : '#e5e7eb'}`,
                            borderRadius: 8, fontSize: '0.88rem', textAlign: 'center',
                            background: overStock ? 'rgba(239,68,68,0.05)' : undefined,
                          }}
                        />
                        {overStock && <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: 2 }}>Exceeds stock!</div>}
                      </td>
                      <td>
                        <input
                          type="number" min="0" value={item.price || ''}
                          onChange={e => updateLineItem(idx, 'price', e.target.value)}
                          style={{ width: 100, padding: '0.5rem', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.88rem', textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{(item.quantity * item.price).toLocaleString()}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => removeLineItem(idx)} style={{ padding: '0.25rem 0.4rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-ghost" onClick={addLineItem}><Plus size={16} /> Add Item</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Grand Total: <span style={{ color: '#16a34a' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!customerName.trim() || lineItems.some(it => !it.productId || it.quantity <= 0)}
                >
                  <Save size={16} /> Save Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bills History */}
      <div className="content-card fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="content-card-header">
          <h3>Bill History ({customerBills.length})</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Grand Total</th>
              <th>Date</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {customerBills.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No customer bills yet. Click "New Customer Bill" to create one.</td></tr>
            ) : (
              customerBills.map(bill => (
                <tr key={bill.id}>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{bill.id}</td>
                  <td style={{ fontWeight: 600 }}>{bill.customerName}</td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      {bill.items.map((it, i) => (
                        <div key={i}>{it.productName} × {it.quantity}</div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{bill.grandTotal.toLocaleString()}</td>
                  <td>{bill.date}</td>
                  <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{bill.createdBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerBillsPage;
