import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { MapPin, Package, X } from 'lucide-react';

// Warehouse layout: 3 sections × 3 racks × 3 shelves (A, B, C | 01-03 | A-C)
const sections = ['A', 'B', 'C'];
const racks = ['01', '02', '03'];
const shelves = ['A', 'B', 'C'];

const WarehouseMapPage: React.FC = () => {
  const { products } = useInventory();
  const [selectedRack, setSelectedRack] = useState<string | null>(null);

  // Build a map: location prefix (e.g. "A-01") → products
  const rackProducts: Record<string, typeof products> = {};
  products.forEach(p => {
    if (!p.location) return;
    const rackKey = p.location.split('-').slice(0, 2).join('-'); // e.g. "A-01"
    if (!rackProducts[rackKey]) rackProducts[rackKey] = [];
    rackProducts[rackKey].push(p);
  });

  const getRackColor = (rackKey: string): string => {
    const prods = rackProducts[rackKey] || [];
    if (prods.length === 0) return '#e5e7eb'; // empty
    const hasLow = prods.some(p => p.status === 'Low Stock');
    const hasOut = prods.some(p => p.status === 'Out of Stock');
    if (hasOut) return '#fca5a5'; // red
    if (hasLow) return '#fde68a'; // yellow
    return '#86efac'; // green
  };

  const getRackTextColor = (rackKey: string): string => {
    const prods = rackProducts[rackKey] || [];
    if (prods.length === 0) return '#9ca3af';
    const hasOut = prods.some(p => p.status === 'Out of Stock');
    if (hasOut) return '#991b1b';
    const hasLow = prods.some(p => p.status === 'Low Stock');
    if (hasLow) return '#92400e';
    return '#166534';
  };

  const selectedProducts = selectedRack ? (rackProducts[selectedRack] || []) : [];

  return (
    <div>
      {/* Legend */}
      <div className="fade-in-up" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#86efac' }} /><span>Normal Stock</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#fde68a' }} /><span>Medium / Low</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#fca5a5' }} /><span>Out of Stock</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#e5e7eb' }} /><span>Empty</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedRack ? '1fr 360px' : '1fr', gap: '1.5rem' }}>
        {/* Warehouse Grid */}
        <div>
          {sections.map(section => (
            <div key={section} className="content-card fade-in-up" style={{ marginBottom: '1.25rem', padding: '1.5rem', animationDelay: `${sections.indexOf(section) * 0.08}s` }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} style={{ color: '#2563eb' }} /> Section {section}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${racks.length}, 1fr)`, gap: '0.75rem' }}>
                {racks.map(rack => {
                  const rackKey = `${section}-${rack}`;
                  const prods = rackProducts[rackKey] || [];
                  const bg = getRackColor(rackKey);
                  const txtColor = getRackTextColor(rackKey);
                  return (
                    <div
                      key={rackKey}
                      onClick={() => setSelectedRack(selectedRack === rackKey ? null : rackKey)}
                      style={{
                        background: bg,
                        borderRadius: 12,
                        padding: '1.25rem 1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: selectedRack === rackKey ? '3px solid #2563eb' : '3px solid transparent',
                        transition: 'all 0.2s',
                        transform: selectedRack === rackKey ? 'scale(1.04)' : 'scale(1)',
                        boxShadow: selectedRack === rackKey ? '0 8px 24px rgba(37,99,235,0.2)' : 'none',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '1.3rem', color: txtColor, letterSpacing: 1 }}>{rackKey}</div>
                      <div style={{ fontSize: '0.78rem', color: txtColor, marginTop: 4, fontWeight: 600 }}>
                        {prods.length} product{prods.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: txtColor, opacity: 0.7, marginTop: 2 }}>
                        {prods.reduce((s, p) => s + p.quantity, 0)} units
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Rack Detail Panel */}
        {selectedRack && (
          <div className="content-card fade-in-up" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                <Package size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Rack {selectedRack}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRack(null)}><X size={16} /></button>
            </div>
            {selectedProducts.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>No products stored here.</p>
            ) : (
              selectedProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f1f1f5', alignItems: 'center' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f1f5' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Shelf {p.location.split('-')[2]} · Qty: {p.quantity}</div>
                  </div>
                  <span className={`badge ${p.status === 'In Stock' ? 'badge-success' : p.status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseMapPage;
