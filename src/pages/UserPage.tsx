import React, { useState } from 'react';
import { useInventory, rolePermissions, type UserRole, type AppUser } from '../context/InventoryContext';
import { supabase } from '../lib/supabase';
import { Search, Plus, Edit2, Trash2, Shield, ShieldCheck, ShieldAlert, UserCog } from 'lucide-react';

const roleIcons: Record<UserRole, React.ReactNode> = {
  Admin: <ShieldAlert size={14} style={{ color: '#dc2626' }} />,
  Manager: <ShieldCheck size={14} style={{ color: '#2563eb' }} />,
  Staff: <Shield size={14} style={{ color: '#16a34a' }} />,
};
const roleBadge: Record<UserRole, string> = { Admin: 'badge-danger', Manager: 'badge-info', Staff: 'badge-success' };

const UserPage: React.FC = () => {
  const { users, setUsers } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Staff' as UserRole, department: '', status: 'Active' as 'Active' | 'Inactive' });

  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', role: 'Staff', department: '', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (u: AppUser) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status });
    setShowModal(true);
  };

  const save = async () => {
    if (editing) {
      const payload: any = { name: form.name, email: form.email, role: form.role, department: form.department, status: form.status };
      const { error } = await supabase.from('app_users').update(payload).eq('id', editing.id);
      if (!error) {
        setUsers(users.map(u => u.id === editing.id ? { ...u, ...form } : u));
      }
    } else {
      const payload = { name: form.name, email: form.email, role: form.role, department: form.department, status: form.status, last_active: 'Just now' };
      const { data, error } = await supabase.from('app_users').insert([payload]).select();
      if (!error && data) {
        setUsers([...users, { id: data[0].id, ...form, lastActive: 'Just now' }]);
      }
    }
    setShowModal(false);
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from('app_users').delete().eq('id', id);
    if (!error) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      {/* Role Legend */}
      <div className="fade-in-up" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['Admin', 'Manager', 'Staff'] as UserRole[]).map(role => (
          <div key={role} className="content-card" style={{ flex: 1, minWidth: 220, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <UserCog size={18} />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{role}</span>
              <span className={`badge ${roleBadge[role]}`} style={{ marginLeft: 'auto' }}>{users.filter(u => u.role === role).length}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.7 }}>
              {rolePermissions[role].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#22c55e' }}>✓</span>
                  {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="fade-in-up" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', animationDelay: '0.05s' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" className="header-search" placeholder="Search users..." style={{ paddingLeft: '2.25rem', width: '100%' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add User</button>
      </div>

      {/* Table */}
      <div className="content-card fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="content-card-header"><h3>Users ({filtered.length})</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Last Active</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ color: '#2563eb' }}>{u.email}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {roleIcons[u.role]}
                    <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
                  </span>
                </td>
                <td>{u.department}</td>
                <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{u.lastActive}</td>
                <td><span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{u.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}><Edit2 size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}><Trash2 size={14} /></button>
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
            <div className="modal-header"><h3>{editing ? 'Edit' : 'Add'} User</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Full Name</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserRole })} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '0.95rem', fontFamily: 'var(--font-sans)', background: '#fafafa' }}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="form-group"><label>Department</label><input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '0.95rem', fontFamily: 'var(--font-sans)', background: '#fafafa' }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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

export default UserPage;
