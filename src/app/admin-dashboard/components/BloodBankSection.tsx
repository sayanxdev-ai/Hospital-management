'use client';
import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Check, X, Download } from 'lucide-react';
import { recordAdminActivity } from '../lib/activityStorage';
import useSubmittedPurchaseOrders from './SubmittedPurchaseOrders';

type BloodStatus = 'Available' | 'Low Availability' | 'Unavailable';

interface BloodRecord {
  id: string;
  bloodGroup: string;
  units: number;
  bloodBank: string;
  location: string;
  contact: string;
  lastUpdated: string;
}

const initialBlood: BloodRecord[] = [
  { id: 'b1', bloodGroup: 'A+', units: 45, bloodBank: 'City Blood Centre', location: 'Mumbai', contact: '+91 22 1234 5678', lastUpdated: '2026-08-24' },
  { id: 'b2', bloodGroup: 'A−', units: 3, bloodBank: 'Red Cross Mumbai', location: 'Mumbai', contact: '+91 22 2345 6789', lastUpdated: '2026-08-24' },
  { id: 'b3', bloodGroup: 'B+', units: 62, bloodBank: 'Apollo Blood Bank', location: 'Pune', contact: '+91 20 3456 7890', lastUpdated: '2026-08-23' },
  { id: 'b4', bloodGroup: 'B−', units: 0, bloodBank: 'Lifeline Blood Bank', location: 'Pune', contact: '+91 20 4567 8901', lastUpdated: '2026-08-22' },
  { id: 'b5', bloodGroup: 'AB+', units: 28, bloodBank: 'Sanjivani Blood Centre', location: 'Nashik', contact: '+91 253 567 8901', lastUpdated: '2026-08-24' },
  { id: 'b6', bloodGroup: 'AB−', units: 1, bloodBank: 'City Blood Centre', location: 'Mumbai', contact: '+91 22 1234 5678', lastUpdated: '2026-08-24' },
  { id: 'b7', bloodGroup: 'O+', units: 88, bloodBank: 'National Blood Bank', location: 'Delhi', contact: '+91 11 6789 0123', lastUpdated: '2026-08-24' },
  { id: 'b8', bloodGroup: 'O−', units: 4, bloodBank: 'Red Cross Delhi', location: 'Delhi', contact: '+91 11 7890 1234', lastUpdated: '2026-08-23' },
  { id: 'b9', bloodGroup: 'A+', units: 30, bloodBank: 'Fortis Blood Bank', location: 'Hyderabad', contact: '+91 40 8901 2345', lastUpdated: '2026-08-22' },
  { id: 'b10', bloodGroup: 'B+', units: 15, bloodBank: 'Care Blood Centre', location: 'Chennai', contact: '+91 44 9012 3456', lastUpdated: '2026-08-21' },
];

const getBloodStatus = (units: number): BloodStatus => units === 0 ? 'Unavailable' : units <= 5 ? 'Low Availability' : 'Available';

const statusConfig: Record<BloodStatus, string> = {
  'Available': 'bg-success/10 text-success border border-success/20',
  'Low Availability': 'bg-warning/10 text-warning border border-warning/20',
  'Unavailable': 'bg-danger/10 text-danger border border-danger/20',
};

export default function BloodBankSection() {
  const purchaseOrders = useSubmittedPurchaseOrders('Blood');
  const [records, setRecords] = useState<BloodRecord[]>(initialBlood);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [modal, setModal] = useState<{ mode: 'edit' | 'add'; rec: BloodRecord | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const bloodGroups = ['All', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.bloodGroup.toLowerCase().includes(q) || r.bloodBank.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    const matchGroup = groupFilter === 'All' || r.bloodGroup === groupFilter;
    return matchSearch && matchGroup;
  }), [records, search, groupFilter]);

  const handleSave = (rec: BloodRecord) => {
    recordAdminActivity({
      category: 'blood',
      tone: rec.units === 0 ? 'danger' : 'success',
      message: `${modal?.mode === 'add' ? 'Blood inventory record added' : 'Blood inventory updated'}: ${rec.bloodGroup}, ${rec.units} units at ${rec.bloodBank}.`,
    });
    if (modal?.mode === 'add') { setRecords(prev => [rec, ...prev]); showToast('Blood record added'); }
    else { setRecords(prev => prev.map(r => r.id === rec.id ? rec : r)); showToast('Blood record updated'); }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    const deletedRecord = records.find(record => record.id === id);
    setRecords(prev => prev.filter(r => r.id !== id));
    if (deletedRecord) recordAdminActivity({ category: 'blood', tone: 'warning', message: `Blood inventory record deleted: ${deletedRecord.bloodGroup} at ${deletedRecord.bloodBank}.` });
    setDeleteConfirm(null);
    showToast('Record deleted');
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = records.map(r => ({ 'Blood Group': r.bloodGroup, 'Units Available': r.units, 'Blood Bank': r.bloodBank, 'Location': r.location, 'Contact': r.contact, 'Status': getBloodStatus(r.units), 'Last Updated': r.lastUpdated }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Blood Inventory');
      XLSX.writeFile(wb, `MediConnect_BloodBank_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Exported to Excel');
    } catch { showToast('Export failed'); }
  };

  const totalUnits = records.reduce((s, r) => s + r.units, 0);

  return (
    <div className="space-y-6 fade-in">
      {toast && <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-success text-white text-sm font-medium fade-in"><Check size={16} />{toast}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Blood Bank</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{records.length} records · {totalUnits} total units</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
            <Download size={16} className="text-success" />Export Excel
          </button>
          <button onClick={() => setModal({ mode: 'add', rec: null })} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} />Add Record
          </button>
        </div>
      </div>

      {/* Blood group summary cards */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map(bg => {
          const total = records.filter(r => r.bloodGroup === bg).reduce((s, r) => s + r.units, 0);
          const status = getBloodStatus(total);
          return (
            <div key={bg} className={`card-base p-3 text-center ${status === 'Unavailable' ? 'border-danger/30' : status === 'Low Availability' ? 'border-warning/30' : 'border-success/30'}`}>
              <p className="text-lg font-extrabold text-foreground">{bg}</p>
              <p className={`text-sm font-bold tabular-nums ${status === 'Unavailable' ? 'text-danger' : status === 'Low Availability' ? 'text-warning' : 'text-success'}`}>{total}</p>
              <p className="text-xs text-muted-foreground">units</p>
            </div>
          );
        })}
      </div>

      <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search blood bank, location..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="select-field text-sm w-36">
          {bloodGroups.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="table-header-cell">Blood Group</th>
                <th className="table-header-cell">Units</th>
                <th className="table-header-cell">Blood Bank</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Contact</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Last Updated</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && purchaseOrders.length === 0 ? (
                <tr><td colSpan={8} className="table-cell text-center text-muted-foreground py-12">No records found</td></tr>
              ) : filtered.map(r => {
                const status = getBloodStatus(r.units);
                return (
                  <tr key={r.id} className="table-row-hover group">
                    <td className="table-cell"><span className={`badge-base font-bold text-sm ${r.bloodGroup.includes('−') ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-info/10 text-info border border-info/20'}`}>{r.bloodGroup}</span></td>
                    <td className="table-cell tabular-nums font-bold text-lg">{r.units}</td>
                    <td className="table-cell font-medium">{r.bloodBank}</td>
                    <td className="table-cell text-muted-foreground">{r.location}</td>
                    <td className="table-cell text-sm text-muted-foreground">{r.contact}</td>
                    <td className="table-cell"><span className={`badge-base text-xs ${statusConfig[status]}`}>{status}</span></td>
                    <td className="table-cell text-xs text-muted-foreground">{r.lastUpdated}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal({ mode: 'edit', rec: r })} className="btn-icon text-muted-foreground hover:text-warning"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteConfirm(r.id)} className="btn-icon text-muted-foreground hover:text-danger"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {purchaseOrders.map(order => (
                <tr key={order.id} className="bg-primary/5 border-t-2 border-primary/20">
                  <td className="table-cell"><span className={`badge-base font-bold text-sm ${order.item.includes('−') ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-info/10 text-info border border-info/20'}`}>{order.item}</span></td>
                  <td className="table-cell tabular-nums font-bold">{order.quantity}</td>
                  <td className="table-cell font-medium">{order.hospital}</td>
                  <td className="table-cell text-muted-foreground">—</td>
                  <td className="table-cell text-sm text-muted-foreground">Staff purchase order</td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <span className="badge-base bg-warning/10 text-warning border border-warning/20 text-xs">Order: {order.status}</span>
                      <span className={`badge-base text-xs ${order.availability === 'Out of Stock' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>{order.availability ?? 'Available'}</span>
                    </div>
                  </td>
                  <td className="table-cell text-xs text-muted-foreground">{order.date}</td>
                  <td className="table-cell text-xs text-muted-foreground">Purchase order</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-foreground mb-2">Delete Record?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently remove the blood inventory record.</p>
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
              <h2 className="text-lg font-bold text-foreground">{modal.mode === 'add' ? 'Add Blood Record' : 'Edit Blood Record'}</h2>
              <button onClick={() => setModal(null)} className="btn-icon text-muted-foreground"><X size={20} /></button>
            </div>
            <BloodForm rec={modal.rec} onClose={() => setModal(null)} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
}

function BloodForm({ rec, onClose, onSave }: { rec: BloodRecord | null; onClose: () => void; onSave: (r: BloodRecord) => void }) {
  const [form, setForm] = useState<BloodRecord>(rec || { id: `b${Date.now()}`, bloodGroup: 'A+', units: 0, bloodBank: '', location: '', contact: '', lastUpdated: new Date().toISOString().split('T')[0] });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Blood Group</label>
          <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Units Available</label>
          <input type="number" value={form.units} onChange={e => setForm(f => ({ ...f, units: parseInt(e.target.value) || 0 }))} min={0} required className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Blood Bank Name</label>
          <input type="text" value={form.bloodBank} onChange={e => setForm(f => ({ ...f, bloodBank: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
          <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Contact</label>
          <input type="text" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
        <button type="submit" className="btn-primary px-6 py-2 text-sm">Save Record</button>
      </div>
    </form>
  );
}
