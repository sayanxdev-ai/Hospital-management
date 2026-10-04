'use client';
import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Check, X, Shield, User } from 'lucide-react';

type UserRole = 'Admin' | 'Staff' | 'User';
type UserStatus = 'Active' | 'Inactive' | 'Suspended';

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  joinDate: string;
  lastLogin: string;
}

const initialUsers: AppUser[] = [
  { id: 'u1', name: 'Sayan Karmakar', email: 'arjun.kapoor@mediconnect.in', phone: '+91 98765 43210', role: 'Admin', department: 'Administration', status: 'Active', joinDate: '2024-01-15', lastLogin: '2026-08-24' },
  { id: 'u2', name: 'Dr. Priya Sharma', email: 'priya.sharma@mediconnect.in', phone: '+91 87654 32109', role: 'Staff', department: 'Cardiology', status: 'Active', joinDate: '2024-03-20', lastLogin: '2026-08-24' },
  { id: 'u3', name: 'Dr. Anjali Singh', email: 'anjali.singh@mediconnect.in', phone: '+91 76543 21098', role: 'Staff', department: 'Gynaecology', status: 'Active', joinDate: '2024-02-10', lastLogin: '2026-08-23' },
  { id: 'u4', name: 'Dr. Vikram Nair', email: 'vikram.nair@mediconnect.in', phone: '+91 65432 10987', role: 'Staff', department: 'Orthopaedics', status: 'Active', joinDate: '2024-04-05', lastLogin: '2026-08-22' },
  { id: 'u5', name: 'Rahul Mehta', email: 'rahul.mehta@gmail.com', phone: '+91 54321 09876', role: 'User', department: 'N/A', status: 'Active', joinDate: '2025-06-12', lastLogin: '2026-08-20' },
  { id: 'u6', name: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+91 43210 98765', role: 'User', department: 'N/A', status: 'Active', joinDate: '2025-08-01', lastLogin: '2026-08-18' },
  { id: 'u7', name: 'Dr. Deepak Rao', email: 'deepak.rao@mediconnect.in', phone: '+91 32109 87654', role: 'Staff', department: 'Gastroenterology', status: 'Inactive', joinDate: '2024-05-15', lastLogin: '2026-07-30' },
  { id: 'u8', name: 'Suresh Kumar', email: 'suresh.kumar@gmail.com', phone: '+91 21098 76543', role: 'User', department: 'N/A', status: 'Suspended', joinDate: '2025-03-22', lastLogin: '2026-06-15' },
];

const roleConfig: Record<UserRole, string> = {
  Admin: 'bg-danger/10 text-danger border border-danger/20',
  Staff: 'bg-info/10 text-info border border-info/20',
  User: 'bg-secondary text-primary border border-primary/20',
};

const statusConfig: Record<UserStatus, string> = {
  Active: 'bg-success/10 text-success border border-success/20',
  Inactive: 'bg-muted text-muted-foreground border border-border',
  Suspended: 'bg-danger/10 text-danger border border-danger/20',
};

export default function UsersSection() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');
  const [modal, setModal] = useState<{ mode: 'edit' | 'add'; user: AppUser | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  }), [users, search, roleFilter, statusFilter]);

  const handleSave = (user: AppUser) => {
    if (modal?.mode === 'add') { setUsers(prev => [user, ...prev]); showToast('User added successfully'); }
    else { setUsers(prev => prev.map(u => u.id === user.id ? user : u)); showToast('User updated successfully'); }
    setModal(null);
  };

  const handleDelete = (id: string) => { setUsers(prev => prev.filter(u => u.id !== id)); setDeleteConfirm(null); showToast('User deleted'); };

  return (
    <div className="space-y-6 fade-in">
      {toast && <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-success text-white text-sm font-medium fade-in"><Check size={16} />{toast}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} users · {users.filter(u => u.role === 'Staff').length} staff · {users.filter(u => u.status === 'Active').length} active</p>
        </div>
        <button onClick={() => setModal({ mode: 'add', user: null })} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} />Add User
        </button>
      </div>

      <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by name, email, department..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
          {(['All', 'Admin', 'Staff', 'User'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${roleFilter === r ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'}`}>{r}</button>
          ))}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'All' | UserStatus)} className="select-field text-sm w-36">
          <option value="All">All Status</option>
          {(Object.keys(statusConfig) as UserStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="table-header-cell">User</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Join Date</th>
                <th className="table-header-cell">Last Login</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-cell text-center text-muted-foreground py-12">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="table-row-hover group">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><span className={`badge-base text-xs flex items-center gap-1 w-fit ${roleConfig[u.role]}`}><Shield size={11} />{u.role}</span></td>
                  <td className="table-cell text-muted-foreground">{u.department}</td>
                  <td className="table-cell"><span className={`badge-base text-xs ${statusConfig[u.status]}`}>{u.status}</span></td>
                  <td className="table-cell text-xs text-muted-foreground">{u.joinDate}</td>
                  <td className="table-cell text-xs text-muted-foreground">{u.lastLogin}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ mode: 'edit', user: u })} className="btn-icon text-muted-foreground hover:text-warning"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(u.id)} className="btn-icon text-muted-foreground hover:text-danger"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {users.length} users</p>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-foreground mb-2">Delete User?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently remove the user account.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">{modal.mode === 'add' ? 'Add User' : 'Edit User'}</h2>
              <button onClick={() => setModal(null)} className="btn-icon text-muted-foreground"><X size={20} /></button>
            </div>
            <UserForm user={modal.user} onClose={() => setModal(null)} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
}

function UserForm({ user, onClose, onSave }: { user: AppUser | null; onClose: () => void; onSave: (u: AppUser) => void }) {
  const [form, setForm] = useState<AppUser>(user || {
    id: `u${Date.now()}`, name: '', email: '', phone: '', role: 'User', department: '', status: 'Active',
    joinDate: new Date().toISOString().split('T')[0], lastLogin: new Date().toISOString().split('T')[0],
  });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email *</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
          <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Admin</option><option>Staff</option><option>User</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as UserStatus }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Active</option><option>Inactive</option><option>Suspended</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Department</label>
          <input type="text" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
        <button type="submit" className="btn-primary px-6 py-2 text-sm">{user ? 'Save Changes' : 'Add User'}</button>
      </div>
    </form>
  );
}
