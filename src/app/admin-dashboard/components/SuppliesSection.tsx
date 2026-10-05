'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Check, X, Download } from 'lucide-react';
import { updateOutOfStockCount } from '../lib/adminData';
import { recordAdminActivity } from '../lib/activityStorage';
import useSubmittedPurchaseOrders from './SubmittedPurchaseOrders';
import PurchaseOrderActions from './PurchaseOrderActions';
import { usePersistentInventory, type InventoryRecord } from '../lib/inventoryStorage';

type SupplyStatus = 'Available' | 'Low Stock' | 'Out of Stock' | 'Expired';

interface Supply extends InventoryRecord {
  category: string;
  minimumStock: number;
  location: string;
  status: SupplyStatus;
  expiryDate?: string;
  batchNumber?: string;
  supplier?: string;
}

const initialSupplies: Supply[] = [
  { id: 's1', name: 'Surgical Gloves (M)', category: 'PPE', quantity: 500, minimumStock: 100, location: 'Store A', status: 'Available' },
  { id: 's2', name: 'Examination Gloves (L)', category: 'PPE', quantity: 3, minimumStock: 50, location: 'Store A', status: 'Low Stock' },
  { id: 's3', name: 'N95 Face Masks', category: 'PPE', quantity: 200, minimumStock: 50, location: 'Store B', status: 'Available' },
  { id: 's4', name: 'Surgical Face Masks', category: 'PPE', quantity: 0, minimumStock: 100, location: 'Store B', status: 'Out of Stock' },
  { id: 's5', name: '5ml Syringes', category: 'Injection', quantity: 800, minimumStock: 200, location: 'Store C', status: 'Available' },
  { id: 's6', name: 'IV Sets', category: 'IV Supplies', quantity: 4, minimumStock: 50, location: 'Store C', status: 'Low Stock' },
  { id: 's7', name: 'Cotton Rolls 500g', category: 'Wound Care', quantity: 120, minimumStock: 30, location: 'Store D', status: 'Available' },
  { id: 's8', name: 'Gauze Bandages 4"', category: 'Wound Care', quantity: 250, minimumStock: 60, location: 'Store D', status: 'Available' },
  { id: 's9', name: 'Digital Thermometers', category: 'Diagnostic', quantity: 45, minimumStock: 10, location: 'Store E', status: 'Available' },
  { id: 's10', name: 'Oxygen Masks (Adult)', category: 'Respiratory', quantity: 2, minimumStock: 20, location: 'Store F', status: 'Low Stock' },
  { id: 's11', name: 'PPE Kits', category: 'PPE', quantity: 80, minimumStock: 20, location: 'Store A', status: 'Available' },
  { id: 's12', name: 'Alcohol Swabs (100pk)', category: 'Antiseptic', quantity: 300, minimumStock: 50, location: 'Store G', status: 'Available' },
  { id: 's13', name: 'IV Cannula 20G', category: 'IV Supplies', quantity: 0, minimumStock: 100, location: 'Store C', status: 'Out of Stock' },
  { id: 's14', name: 'Urine Bags 2L', category: 'Urological', quantity: 60, minimumStock: 20, location: 'Store H', status: 'Available' },
  { id: 's15', name: 'Kidney Trays (SS)', category: 'Surgical', quantity: 35, minimumStock: 10, location: 'Store I', status: 'Available' },
  { id: 's16', name: 'Surgical Scissors (Straight)', category: 'Surgical', quantity: 24, minimumStock: 6, location: 'Store I', status: 'Available' },
  { id: 's17', name: 'Surgical Scissors (Curved)', category: 'Surgical', quantity: 18, minimumStock: 6, location: 'Store I', status: 'Available' },
  { id: 's18', name: 'Sterilization Pouches (100pk)', category: 'Sterilization', quantity: 120, minimumStock: 25, location: 'Store J', status: 'Available' },
  { id: 's19', name: 'Autoclave Indicator Tape', category: 'Sterilization', quantity: 40, minimumStock: 10, location: 'Store J', status: 'Available' },
  { id: 's20', name: 'Sterile Dressing Packs', category: 'Wound Care', quantity: 75, minimumStock: 20, location: 'Store D', status: 'Available' },
  { id: 's21', name: 'Crepe Bandages 10cm', category: 'Wound Care', quantity: 100, minimumStock: 25, location: 'Store D', status: 'Available' },
  { id: 's22', name: 'Medical Adhesive Tape 2.5cm', category: 'Wound Care', quantity: 90, minimumStock: 20, location: 'Store D', status: 'Available' },
  { id: 's23', name: '2ml Syringes', category: 'Injection', quantity: 400, minimumStock: 100, location: 'Store C', status: 'Available' },
  { id: 's24', name: '10ml Syringes', category: 'Injection', quantity: 350, minimumStock: 100, location: 'Store C', status: 'Available' },
  { id: 's25', name: 'Disposable Surgical Gowns', category: 'PPE', quantity: 100, minimumStock: 25, location: 'Store A', status: 'Available' },
  { id: 's26', name: 'Face Shields', category: 'PPE', quantity: 80, minimumStock: 20, location: 'Store B', status: 'Available' },
];

const getStatus = (qty: number, min: number, expiryDate?: string): SupplyStatus => {
  if (expiryDate && expiryDate < new Date().toISOString().slice(0, 10)) return 'Expired';
  return qty === 0 ? 'Out of Stock' : qty <= min ? 'Low Stock' : 'Available';
};

const statusConfig: Record<SupplyStatus, string> = {
  'Available': 'bg-success/10 text-success border border-success/20',
  'Low Stock': 'bg-warning/10 text-warning border border-warning/20',
  'Out of Stock': 'bg-danger/10 text-danger border border-danger/20',
  'Expired': 'bg-danger/10 text-danger border border-danger/20',
};

export default function SuppliesSection() {
  const purchaseOrders = useSubmittedPurchaseOrders('Supplies');
  const [supplies, setSupplies] = usePersistentInventory<Supply>('supplies', initialSupplies);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | SupplyStatus>('All');
  const [modal, setModal] = useState<{ mode: 'edit' | 'add'; sup: Supply | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    updateOutOfStockCount('supply', supplies.filter(supply => supply.quantity === 0).length);
  }, [supplies]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const categories = ['All', ...Array.from(new Set(supplies.map(s => s.category))).sort()];

  const filtered = useMemo(() => supplies.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || (s.batchNumber || '').toLowerCase().includes(q) || (s.supplier || '').toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || s.category === catFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [supplies, search, catFilter, statusFilter]);

  const handleSave = (sup: Supply) => {
    const updated = { ...sup, status: getStatus(sup.quantity, sup.minimumStock, sup.expiryDate) };
    recordAdminActivity({
      category: 'supply',
      tone: updated.status === 'Out of Stock' ? 'danger' : 'success',
      message: `${modal?.mode === 'add' ? 'Supply added' : 'Supply updated'}: ${updated.name} (${updated.quantity} units, ${updated.status}).`,
    });
    if (modal?.mode === 'add') { setSupplies(prev => [updated, ...prev]); showToast('Supply added'); }
    else { setSupplies(prev => prev.map(s => s.id === updated.id ? updated : s)); showToast('Supply updated'); }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    const deletedSupply = supplies.find(supply => supply.id === id);
    setSupplies(prev => prev.filter(s => s.id !== id));
    if (deletedSupply) recordAdminActivity({ category: 'supply', tone: 'warning', message: `Supply deleted: ${deletedSupply.name}.` });
    setDeleteConfirm(null);
    showToast('Supply deleted');
  };

  const adjustStock = (supply: Supply, delta: number) => {
    if (supply.quantity + delta < 0) return;
    const updated = { ...supply, quantity: supply.quantity + delta };
    updated.status = getStatus(updated.quantity, updated.minimumStock, updated.expiryDate);
    setSupplies(previous => previous.map(item => item.id === supply.id ? updated : item));
    recordAdminActivity({
      category: 'supply',
      tone: delta < 0 ? 'warning' : 'info',
      message: `Stock adjusted for ${supply.name}: ${supply.quantity} → ${updated.quantity} (batch ${supply.batchNumber || 'not recorded'}).`,
    });
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = supplies.map(s => ({ 'Item Name': s.name, 'Category': s.category, 'Quantity': s.quantity, 'Minimum Stock': s.minimumStock, 'Batch Number': s.batchNumber || '', 'Expiry Date': s.expiryDate || '', 'Supplier': s.supplier || '', 'Location': s.location, 'Status': getStatus(s.quantity, s.minimumStock, s.expiryDate) }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 14 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Supplies');
      XLSX.writeFile(wb, `MediConnect_Supplies_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Exported to Excel');
    } catch { showToast('Export failed'); }
  };

  return (
    <div className="space-y-6 fade-in">
      {toast && <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-success text-white text-sm font-medium fade-in"><Check size={16} />{toast}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Medical Supplies</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{supplies.length} items · {supplies.filter(s => s.status === 'Low Stock').length} low stock · {supplies.filter(s => s.status === 'Out of Stock').length} out of stock · {supplies.filter(s => s.expiryDate && s.expiryDate >= new Date().toISOString().slice(0, 10) && s.expiryDate <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)).length} expiring within 30 days</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
            <Download size={16} className="text-success" />Export Excel
          </button>
          <button onClick={() => setModal({ mode: 'add', sup: null })} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} />Add Supply
          </button>
        </div>
      </div>
      <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search supplies..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="select-field text-sm w-40">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'All' | SupplyStatus)} className="select-field text-sm w-40">
          <option value="All">All Status</option>
          {(Object.keys(statusConfig) as SupplyStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="table-header-cell">Item Name</th>
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Quantity</th>
                <th className="table-header-cell">Min. Stock</th>
                <th className="table-header-cell">Batch / Expiry</th>
                <th className="table-header-cell">Supplier</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && purchaseOrders.length === 0 ? (
                <tr><td colSpan={9} className="table-cell text-center text-muted-foreground py-12">No supplies found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="table-row-hover group">
                  <td className="table-cell font-semibold text-foreground">{s.name}</td>
                  <td className="table-cell"><span className="badge-base bg-secondary text-primary border border-primary/20 text-xs">{s.category}</span></td>
                  <td className="table-cell tabular-nums font-bold">{s.quantity}</td>
                  <td className="table-cell tabular-nums text-muted-foreground">{s.minimumStock}</td>
                  <td className="table-cell text-xs text-muted-foreground">{s.batchNumber || '—'}{s.expiryDate ? ` / ${s.expiryDate}` : ''}</td>
                  <td className="table-cell text-muted-foreground">{s.supplier || '—'}</td>
                  <td className="table-cell text-muted-foreground">{s.location}</td>
                  <td className="table-cell">
                    {(() => {
                      const currentStatus = getStatus(s.quantity, s.minimumStock, s.expiryDate);
                      return <span className={`badge-base text-xs ${statusConfig[currentStatus]}`}>{currentStatus}</span>;
                    })()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => adjustStock(s, -1)} className="btn-icon text-muted-foreground hover:text-warning" title="Reduce stock by one"><span aria-hidden="true">−</span></button>
                      <button onClick={() => adjustStock(s, 1)} className="btn-icon text-muted-foreground hover:text-success" title="Increase stock by one"><Plus size={15} /></button>
                      <button onClick={() => setModal({ mode: 'edit', sup: s })} className="btn-icon text-muted-foreground hover:text-warning"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(s.id)} className="btn-icon text-muted-foreground hover:text-danger"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchaseOrders.map(order => (
                <tr key={order.id} className="bg-primary/5 border-t-2 border-primary/20 group">
                  <td className="table-cell font-semibold text-foreground">{order.item}</td>
                  <td className="table-cell"><span className="badge-base bg-secondary text-primary border border-primary/20 text-xs">Staff purchase order</span></td>
                  <td className="table-cell tabular-nums font-bold">{order.quantity}</td>
                  <td className="table-cell tabular-nums text-muted-foreground">—</td>
                  <td className="table-cell text-xs text-muted-foreground">{order.batchNumber || '—'}{order.expiryDate ? ` / ${order.expiryDate}` : ''}</td>
                  <td className="table-cell text-muted-foreground">{order.hospital}</td>
                  <td className="table-cell text-muted-foreground">—</td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <span className="badge-base bg-warning/10 text-warning border border-warning/20 text-xs">Order: {order.purchaseStatus || 'Pending Approval'}</span>
                      <span className={`badge-base text-xs ${order.availability === 'Out of Stock' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>{order.availability ?? 'Available'}</span>
                    </div>
                  </td>
                  <td className="table-cell"><PurchaseOrderActions order={order} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-foreground">{filtered.length + purchaseOrders.length}</span> items · {filtered.length} supplies · {purchaseOrders.length} submitted orders</p>
        </div>
      </div>
      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-foreground mb-2">Delete Supply?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently remove the supply record.</p>
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
              <h2 className="text-lg font-bold text-foreground">{modal.mode === 'add' ? 'Add Supply' : 'Edit Supply'}</h2>
              <button onClick={() => setModal(null)} className="btn-icon text-muted-foreground"><X size={20} /></button>
            </div>
            <SupplyForm sup={modal.sup} onClose={() => setModal(null)} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
}

function SupplyForm({ sup, onClose, onSave }: { sup: Supply | null; onClose: () => void; onSave: (s: Supply) => void }) {
  const [form, setForm] = useState<Supply>(sup || { id: `s${Date.now()}`, name: '', category: 'PPE', quantity: 0, minimumStock: 10, location: '', batchNumber: '', expiryDate: '', supplier: '', status: 'Available' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Item Name *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {['PPE', 'Injection', 'IV Supplies', 'Wound Care', 'Diagnostic', 'Respiratory', 'Antiseptic', 'Urological', 'Surgical', 'Sterilization', 'Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
          <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quantity</label>
          <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} min={0} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Minimum Stock</label>
          <input type="number" value={form.minimumStock} onChange={e => setForm(f => ({ ...f, minimumStock: parseInt(e.target.value) || 0 }))} min={0} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Batch Number</label>
          <input type="text" value={form.batchNumber || ''} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Expiry Date</label>
          <input type="date" value={form.expiryDate || ''} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Supplier</label>
          <input type="text" value={form.supplier || ''} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
        <button type="submit" className="btn-primary px-6 py-2 text-sm">Save Supply</button>
      </div>
    </form>
  );
}
