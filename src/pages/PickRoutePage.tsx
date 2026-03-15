import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Navigation, MapPin, Package, ChevronRight } from 'lucide-react';

const sections = ['A', 'B', 'C'];
const racks = ['01', '02', '03'];

// Sample orders to demonstrate
const sampleOrders = [
  { id: 'ORD-1001', productIds: [1, 6, 11, 15] },
  { id: 'ORD-1002', productIds: [2, 8, 13, 17] },
  { id: 'ORD-1003', productIds: [3, 7, 12, 19] },
  { id: 'ORD-1004', productIds: [5, 10, 14, 22] },
  { id: 'ORD-1005', productIds: [4, 9, 16, 21] },
];

const PickRoutePage: React.FC = () => {
  const { products } = useInventory();
  const [selectedOrder, setSelectedOrder] = useState(sampleOrders[0].id);

  const order = sampleOrders.find(o => o.id === selectedOrder)!;
  const orderProducts = order.productIds.map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products;

  // Sort by location for optimal path
  const sortedProducts = useMemo(() => {
    return [...orderProducts].sort((a, b) => a.location.localeCompare(b.location));
  }, [orderProducts]);

  const visitedRacks = new Set(sortedProducts.map(p => p.location.split('-').slice(0, 2).join('-')));

  return (
    <div>
      {/* Order Selector */}
      <div className="fade-in-up" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Order:</label>
        <select
          value={selectedOrder}
          onChange={e => setSelectedOrder(e.target.value)}
          style={{ padding: '0.5rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.95rem', background: '#fafafa', fontFamily: 'var(--font-sans)', minWidth: 140 }}
        >
          {sampleOrders.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
        </select>
        <span style={{ fontSize: '0.88rem', color: '#6b7280' }}>{orderProducts.length} products</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Optimal Path */}
        <div className="content-card fade-in-up" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={18} style={{ color: '#2563eb' }} /> Optimal Pick Path
          </h3>
          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)', borderRadius: 1 }} />
            {sortedProducts.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', position: 'relative' }}>
                {/* Step Circle */}
                <div style={{
                  position: 'absolute', left: -26, width: 24, height: 24, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, zIndex: 1,
                }}>
                  {i + 1}
                </div>
                {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{p.category}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0f9ff', padding: '0.3rem 0.6rem', borderRadius: 8 }}>
                  <MapPin size={12} style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e40af', fontFamily: 'monospace' }}>{p.location}</span>
                </div>
                {i < sortedProducts.length - 1 && (
                  <ChevronRight size={14} style={{ color: '#d1d5db', position: 'absolute', right: -6 }} />
                )}
              </div>
            ))}
          </div>
          {/* Total distance estimate */}
          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ fontWeight: 600 }}>Estimated Path</span>
            <span style={{ fontWeight: 700, color: '#2563eb' }}>{visitedRacks.size} racks · {sortedProducts.length} stops</span>
          </div>
        </div>

        {/* Warehouse Visual Grid */}
        <div className="content-card fade-in-up" style={{ padding: '1.5rem', animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} style={{ color: '#16a34a' }} /> Warehouse Layout
          </h3>
          {sections.map(section => (
            <div key={section} style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>Section {section}</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${racks.length}, 1fr)`, gap: '0.5rem' }}>
                {racks.map(rack => {
                  const rackKey = `${section}-${rack}`;
                  const isVisited = visitedRacks.has(rackKey);
                  const productsInRack = sortedProducts.filter(p => p.location.startsWith(rackKey));
                  return (
                    <div
                      key={rackKey}
                      style={{
                        background: isVisited ? 'linear-gradient(135deg, #dbeafe, #ede9fe)' : '#f9fafb',
                        borderRadius: 10,
                        padding: '1rem 0.75rem',
                        textAlign: 'center',
                        border: isVisited ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                        transition: 'all 0.3s',
                        boxShadow: isVisited ? '0 4px 16px rgba(59,130,246,0.15)' : 'none',
                        position: 'relative',
                      }}
                    >
                      {isVisited && (
                        <div style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✓
                        </div>
                      )}
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isVisited ? '#1e40af' : '#9ca3af' }}>{rackKey}</div>
                      {productsInRack.length > 0 && (
                        <div style={{ marginTop: 4, fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                          {productsInRack.map(p => p.name.split(' ')[0]).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Path Summary */}
          <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: 12, fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
            Route: {[...visitedRacks].sort().join(' → ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickRoutePage;
