'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Minus, Edit2, Trash2, Eye, Check, X, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { updateOutOfStockCount } from '../lib/adminData';
import { recordAdminActivity } from '../lib/activityStorage';
import useSubmittedPurchaseOrders from './SubmittedPurchaseOrders';
import PurchaseOrderActions from './PurchaseOrderActions';
import { usePersistentInventory, type InventoryRecord } from '../lib/inventoryStorage';

type MedStatus = 'Available' | 'Low Stock' | 'Out of Stock' | 'Expired';

interface Medicine extends InventoryRecord {
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  expiryDate: string;
  prescriptionRequired: boolean;
  location: string;
  status: MedStatus;
}

const initialMedicines: Medicine[] = [
  { id: 'm1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'Cipla', quantity: 450, price: 12, expiryDate: '2027-06-30', prescriptionRequired: false, location: 'Shelf A1', status: 'Available' },
  { id: 'm2', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', manufacturer: 'Sun Pharma', quantity: 320, price: 18, expiryDate: '2027-03-31', prescriptionRequired: false, location: 'Shelf A2', status: 'Available' },
  { id: 'm3', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', manufacturer: 'Dr. Reddy\'s', quantity: 0, price: 8, expiryDate: '2026-12-31', prescriptionRequired: false, location: 'Shelf B1', status: 'Out of Stock' },
  { id: 'm4', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Cipla', quantity: 85, price: 65, expiryDate: '2027-01-31', prescriptionRequired: true, location: 'Shelf C1', status: 'Available' },
  { id: 'm5', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'Alkem', quantity: 4, price: 45, expiryDate: '2026-10-31', prescriptionRequired: true, location: 'Shelf C2', status: 'Low Stock' },
  { id: 'm6', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', category: 'PPI', manufacturer: 'Zydus', quantity: 200, price: 22, expiryDate: '2027-08-31', prescriptionRequired: true, location: 'Shelf D1', status: 'Available' },
  { id: 'm7', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'PPI', manufacturer: 'Sun Pharma', quantity: 3, price: 15, expiryDate: '2026-11-30', prescriptionRequired: false, location: 'Shelf D2', status: 'Low Stock' },
  { id: 'm8', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'USV', quantity: 380, price: 10, expiryDate: '2027-05-31', prescriptionRequired: true, location: 'Shelf E1', status: 'Available' },
  { id: 'm9', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', manufacturer: 'Cipla', quantity: 150, price: 20, expiryDate: '2027-04-30', prescriptionRequired: true, location: 'Shelf E2', status: 'Available' },
  { id: 'm10', name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', category: 'Antiplatelet', manufacturer: 'Bayer', quantity: 500, price: 5, expiryDate: '2028-01-31', prescriptionRequired: false, location: 'Shelf A3', status: 'Available' },
  { id: 'm11', name: 'Insulin Glargine', genericName: 'Insulin Glargine', category: 'Antidiabetic', manufacturer: 'Sanofi', quantity: 2, price: 850, expiryDate: '2026-09-30', prescriptionRequired: true, location: 'Refrigerator R1', status: 'Low Stock' },
  { id: 'm12', name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Bronchodilator', manufacturer: 'GSK', quantity: 45, price: 120, expiryDate: '2027-02-28', prescriptionRequired: true, location: 'Shelf F1', status: 'Available' },
  { id: 'm13', name: 'Vitamin D3 60000IU', genericName: 'Cholecalciferol', category: 'Vitamin', manufacturer: 'Mankind', quantity: 180, price: 35, expiryDate: '2027-07-31', prescriptionRequired: false, location: 'Shelf G1', status: 'Available' },
  { id: 'm14', name: 'Vitamin B12 500mcg', genericName: 'Cyanocobalamin', category: 'Vitamin', manufacturer: 'Abbott', quantity: 0, price: 28, expiryDate: '2027-03-31', prescriptionRequired: false, location: 'Shelf G2', status: 'Out of Stock' },
  { id: 'm15', name: 'Ondansetron 4mg', genericName: 'Ondansetron HCl', category: 'Antiemetic', manufacturer: 'Cipla', quantity: 95, price: 30, expiryDate: '2027-06-30', prescriptionRequired: true, location: 'Shelf H1', status: 'Available' },
  { id: 'm16', name: 'Dolo 650mg', genericName: 'Paracetamol', category: 'Analgesic', manufacturer: 'Micro Labs', quantity: 300, price: 18, expiryDate: '2027-12-31', prescriptionRequired: false, location: 'Shelf A4', status: 'Available' },
  { id: 'm17', name: 'Saridon', genericName: 'Paracetamol + Propyphenazone + Caffeine', category: 'Analgesic', manufacturer: 'Bayer', quantity: 120, price: 25, expiryDate: '2027-11-30', prescriptionRequired: false, location: 'Shelf A5', status: 'Available' },
  { id: 'm18', name: 'Famotidine 20mg', genericName: 'Famotidine', category: 'Antacid', manufacturer: 'Sun Pharma', quantity: 160, price: 16, expiryDate: '2027-10-31', prescriptionRequired: false, location: 'Shelf D3', status: 'Available' },
  { id: 'm19', name: 'Antacid Suspension 200ml', genericName: 'Aluminium Hydroxide + Magnesium Hydroxide', category: 'Antacid', manufacturer: 'Abbott', quantity: 90, price: 85, expiryDate: '2027-08-31', prescriptionRequired: false, location: 'Shelf D4', status: 'Available' },
  { id: 'm20', name: 'ORS Sachets', genericName: 'Oral Rehydration Salts', category: 'Rehydration', manufacturer: 'Cipla', quantity: 240, price: 8, expiryDate: '2027-09-30', prescriptionRequired: false, location: 'Shelf G3', status: 'Available' },
  { id: 'm21', name: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', category: 'Vitamin', manufacturer: 'Mankind', quantity: 180, price: 12, expiryDate: '2028-01-31', prescriptionRequired: false, location: 'Shelf G4', status: 'Available' },
  { id: 'm22', name: 'Clotrimazole 1% Cream 15g', genericName: 'Clotrimazole', category: 'Antifungal', manufacturer: 'Cipla', quantity: 75, price: 48, expiryDate: '2027-07-31', prescriptionRequired: false, location: 'Shelf J1', status: 'Available' },
  { id: 'm23', name: 'Diclofenac Gel 30g', genericName: 'Diclofenac Diethylamine', category: 'Topical Pain Relief', manufacturer: 'Novartis', quantity: 65, price: 95, expiryDate: '2027-06-30', prescriptionRequired: false, location: 'Shelf J2', status: 'Available' },
  { id: 'm24', name: 'Mupirocin 2% Ointment 5g', genericName: 'Mupirocin', category: 'Topical Antibiotic', manufacturer: 'Glenmark', quantity: 40, price: 75, expiryDate: '2027-05-31', prescriptionRequired: true, location: 'Shelf J3', status: 'Available' },
];

const statusConfig: Record<MedStatus, string> = {
  'Available': 'bg-success/10 text-success border border-success/20',
  'Low Stock': 'bg-warning/10 text-warning border border-warning/20',
  'Out of Stock': 'bg-danger/10 text-danger border border-danger/20',
  'Expired': 'bg-danger/10 text-danger border border-danger/20',
};

const getStatus = (qty: number, expiryDate: string): MedStatus => {
  if (expiryDate && expiryDate < new Date().toISOString().slice(0, 10)) return 'Expired';
  return qty === 0 ? 'Out of Stock' : qty <= 5 ? 'Low Stock' : 'Available';
};

export default function MedicinesSection() {
  const purchaseOrders = useSubmittedPurchaseOrders('Medicine');
  const [medicines, setMedicines] = usePersistentInventory<Medicine>('medicine', initialMedicines);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | MedStatus>('All');
  const [modal, setModal] = useState<{ mode: 'view' | 'edit' | 'add'; med: Medicine | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Medicine>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    updateOutOfStockCount('medicine', medicines.filter(medicine => medicine.quantity === 0).length);
  }, [medicines]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const categories = ['All', ...Array.from(new Set(medicines.map(m => m.category))).sort()];

  const filtered = useMemo(() => {
    let list = medicines.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q) || (m.supplier || '').toLowerCase().includes(q) || (m.batchNumber || '').toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
      const matchCat = catFilter === 'All' || m.category === catFilter;
      const matchStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
    return [...list].sort((a, b) => {
      const av = String(a[sortField]);
      const bv = String(b[sortField]);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [medicines, search, catFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: keyof Medicine) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSave = (med: Medicine) => {
    const updated = { ...med, status: getStatus(med.quantity, med.expiryDate) };
    recordAdminActivity({
      category: 'medicine',
      tone: updated.status === 'Out of Stock' ? 'danger' : 'success',
      message: `${modal?.mode === 'add' ? 'Medicine added' : 'Medicine updated'}: ${updated.name} (${updated.quantity} units, ${updated.status}).`,
    });
    if (modal?.mode === 'add') {
      setMedicines(prev => [updated, ...prev]);
      showToast('Medicine added successfully');
    } else {
      setMedicines(prev => prev.map(m => m.id === updated.id ? updated : m));
      showToast('Medicine updated successfully');
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    const deletedMedicine = medicines.find(medicine => medicine.id === id);
    setMedicines(prev => prev.filter(m => m.id !== id));
    if (deletedMedicine) {
      recordAdminActivity({ category: 'medicine', tone: 'warning', message: `Medicine deleted: ${deletedMedicine.name}.` });
    }
    setDeleteConfirm(null);
    showToast('Medicine deleted');
  };

  const adjustStock = (medicine: Medicine, delta: number) => {
    if (medicine.quantity + delta < 0) return;
    const updated = { ...medicine, quantity: medicine.quantity + delta };
    updated.status = getStatus(updated.quantity, updated.expiryDate);
    setMedicines(previous => previous.map(item => item.id === medicine.id ? updated : item));
    recordAdminActivity({
      category: 'medicine',
      tone: delta < 0 ? 'warning' : 'info',
      message: `Stock adjusted for ${medicine.name}: ${medicine.quantity} → ${updated.quantity} (batch ${medicine.batchNumber || 'not recorded'}).`,
    });
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = medicines.map(m => ({
        'Name': m.name, 'Generic Name': m.genericName, 'Category': m.category,
        'Manufacturer': m.manufacturer, 'Quantity': m.quantity, 'Price (₹)': m.price,
        'Expiry Date': m.expiryDate, 'Prescription Required': m.prescriptionRequired ? 'Yes' : 'No',
          'Batch Number': m.batchNumber || '', 'Supplier': m.supplier || '', 'Location': m.location, 'Status': getStatus(m.quantity, m.expiryDate),
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 15 }, { wch: 14 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Medicines');
      XLSX.writeFile(wb, `MediConnect_Medicines_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast(`Exported ${medicines.length} medicines to Excel`);
    } catch { showToast('Export failed'); }
  };

  const SortIcon = ({ field }: { field: keyof Medicine }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  return (
    <div className="space-y-6 fade-in">
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-success text-white text-sm font-medium fade-in">
          <Check size={16} />{toast}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{medicines.length} total · {medicines.filter(m => m.status === 'Low Stock').length} low stock · {medicines.filter(m => m.status === 'Out of Stock').length} out of stock · {medicines.filter(m => m.expiryDate && m.expiryDate >= new Date().toISOString().slice(0, 10) && m.expiryDate <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)).length} expiring within 30 days</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
            <Download size={16} className="text-success" />Export Excel
          </button>
          <button onClick={() => setModal({ mode: 'add', med: null })} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} />Add Medicine
          </button>
        </div>
      </div>

      <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by name, generic name, manufacturer..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="select-field text-sm w-44">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'All' | MedStatus)} className="select-field text-sm w-40">
          <option value="All">All Status</option>
          {(Object.keys(statusConfig) as MedStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {[
                  { label: 'Name', field: 'name' as keyof Medicine },
                  { label: 'Generic', field: 'genericName' as keyof Medicine },
                  { label: 'Category', field: 'category' as keyof Medicine },
                  { label: 'Manufacturer', field: 'manufacturer' as keyof Medicine },
                  { label: 'Qty', field: 'quantity' as keyof Medicine },
                  { label: 'Price', field: 'price' as keyof Medicine },
                  { label: 'Batch', field: 'batchNumber' as keyof Medicine },
                  { label: 'Expiry', field: 'expiryDate' as keyof Medicine },
                  { label: 'Supplier', field: 'supplier' as keyof Medicine },
                  { label: 'Rx', field: 'prescriptionRequired' as keyof Medicine },
                  { label: 'Status', field: 'status' as keyof Medicine },
                ].map(col => (
                  <th key={col.field} className="table-header-cell cursor-pointer select-none" onClick={() => handleSort(col.field)}>
                    <div className="flex items-center gap-1">{col.label}<SortIcon field={col.field} /></div>
                  </th>
                ))}
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && purchaseOrders.length === 0 ? (
                <tr><td colSpan={12} className="table-cell text-center text-muted-foreground py-16">
                  <div className="flex flex-col items-center gap-2"><Search size={32} className="text-muted-foreground/30" /><p>No medicines found</p></div>
                </td></tr>
              ) : filtered.map(m => (
                <tr key={m.id} className="table-row-hover group">
                  <td className="table-cell font-semibold text-foreground whitespace-nowrap">{m.name}</td>
                  <td className="table-cell text-muted-foreground text-sm">{m.genericName}</td>
                  <td className="table-cell"><span className="badge-base bg-secondary text-primary border border-primary/20 text-xs">{m.category}</span></td>
                  <td className="table-cell text-sm text-muted-foreground">{m.manufacturer}</td>
                  <td className="table-cell tabular-nums font-semibold">{m.quantity}</td>
                  <td className="table-cell tabular-nums">₹{m.price}</td>
                  <td className="table-cell text-xs text-muted-foreground">{m.batchNumber || '—'}</td>
                  <td className="table-cell text-xs text-muted-foreground whitespace-nowrap">{m.expiryDate}</td>
                  <td className="table-cell text-xs text-muted-foreground">{m.supplier || '—'}</td>
                  <td className="table-cell text-center">{m.prescriptionRequired ? <span className="text-warning text-xs font-bold">Rx</span> : <span className="text-muted-foreground text-xs">OTC</span>}</td>
                  <td className="table-cell">
                    {(() => {
                      const currentStatus = getStatus(m.quantity, m.expiryDate);
                      return <span className={`badge-base text-xs ${statusConfig[currentStatus]}`}>{currentStatus}</span>;
                    })()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => adjustStock(m, -1)} className="btn-icon text-muted-foreground hover:text-warning" title="Reduce stock by one"><Minus size={15} /></button>
                      <button onClick={() => adjustStock(m, 1)} className="btn-icon text-muted-foreground hover:text-success" title="Increase stock by one"><Plus size={15} /></button>
                      <button onClick={() => setModal({ mode: 'view', med: m })} className="btn-icon text-muted-foreground hover:text-primary" title="View"><Eye size={15} /></button>
                      <button onClick={() => setModal({ mode: 'edit', med: m })} className="btn-icon text-muted-foreground hover:text-warning" title="Edit"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(m.id)} className="btn-icon text-muted-foreground hover:text-danger" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchaseOrders.map(order => (
                <tr key={order.id} className="bg-primary/5 border-t-2 border-primary/20 group">
                  <td className="table-cell font-semibold text-foreground whitespace-nowrap">{order.item}</td>
                  <td className="table-cell text-muted-foreground text-sm">Staff purchase order</td>
                  <td className="table-cell"><span className="badge-base bg-secondary text-primary border border-primary/20 text-xs">Order</span></td>
                  <td className="table-cell text-sm text-muted-foreground">—</td>
                  <td className="table-cell tabular-nums font-semibold">{order.quantity}</td>
                  <td className="table-cell">—</td>
                  <td className="table-cell text-xs text-muted-foreground">{order.batchNumber || '—'}</td>
                  <td className="table-cell text-xs text-muted-foreground whitespace-nowrap">{order.expiryDate || '—'}</td>
                  <td className="table-cell text-sm text-muted-foreground">{order.hospital}</td>
                  <td className="table-cell text-center text-muted-foreground">—</td>
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
          <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-foreground">{filtered.length + purchaseOrders.length}</span> items · {filtered.length} medicines · {purchaseOrders.length} submitted orders</p>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-foreground mb-2">Delete Medicine?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently remove the medicine record.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {modal && <MedicineModal med={modal.med} mode={modal.mode} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}

function MedicineModal({ med, mode, onClose, onSave }: { med: Medicine | null; mode: 'view' | 'edit' | 'add'; onClose: () => void; onSave: (m: Medicine) => void }) {
  const [form, setForm] = useState<Medicine>(med || {
    id: `m${Date.now()}`, name: '', genericName: '', category: 'Analgesic', manufacturer: '',
    quantity: 0, price: 0, expiryDate: '', prescriptionRequired: false, location: '', status: 'Available',
  });
  const isReadOnly = mode === 'view';
  const handleChange = (field: keyof Medicine, value: string | number | boolean) => setForm(p => ({ ...p, [field]: value }));

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold text-foreground">{mode === 'add' ? 'Add Medicine' : mode === 'edit' ? 'Edit Medicine' : 'Medicine Details'}</h2>
          <button onClick={onClose} className="btn-icon text-muted-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Medicine Name *', field: 'name', type: 'text' },
            { label: 'Generic Name', field: 'genericName', type: 'text' },
            { label: 'Manufacturer', field: 'manufacturer', type: 'text' },
            { label: 'Supplier', field: 'supplier', type: 'text' },
            { label: 'Batch Number', field: 'batchNumber', type: 'text' },
            { label: 'Quantity', field: 'quantity', type: 'number' },
            { label: 'Price (₹)', field: 'price', type: 'number' },
            { label: 'Expiry Date', field: 'expiryDate', type: 'date' },
            { label: 'Location', field: 'location', type: 'text' },
          ].map(f => (
            <div key={f.field}>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}</label>
              <input type={f.type} value={String(form[f.field as keyof Medicine])} onChange={e => handleChange(f.field as keyof Medicine, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} readOnly={isReadOnly} required={f.label.includes('*')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
            <select value={form.category} onChange={e => handleChange('category', e.target.value)} disabled={isReadOnly} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {['Analgesic', 'NSAID', 'Antibiotic', 'Antihistamine', 'PPI', 'Antidiabetic', 'Antihypertensive', 'Antiplatelet', 'Bronchodilator', 'Vitamin', 'Antiemetic', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 py-2">
            <label className="text-sm font-medium text-foreground">Prescription Required</label>
            <button type="button" onClick={() => !isReadOnly && handleChange('prescriptionRequired', !form.prescriptionRequired)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.prescriptionRequired ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.prescriptionRequired ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {!isReadOnly && (
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" className="btn-primary px-6 py-2 text-sm">{mode === 'add' ? 'Add Medicine' : 'Save Changes'}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
