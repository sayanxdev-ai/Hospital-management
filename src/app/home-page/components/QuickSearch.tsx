'use client';
import React, { useState } from 'react';
import { Search, Pill, X } from 'lucide-react';
import { addAdminRequest } from '@/app/admin-dashboard/lib/adminData';
import { recordAdminActivity } from '@/app/admin-dashboard/lib/activityStorage';
import { getStoredSession } from '@/lib/auth';

const medicines = [
  { id: 'med-001', name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Analgesic', price: 12, qty: 450, location: 'Pharmacy A', rx: false, status: 'available' },
  { id: 'med-002', name: 'Ibuprofen 400mg', generic: 'Ibuprofen', category: 'Anti-inflammatory', price: 28, qty: 280, location: 'Pharmacy B', rx: false, status: 'available' },
  { id: 'med-003', name: 'Azithromycin 500mg', generic: 'Azithromycin', category: 'Antibiotic', price: 85, qty: 45, location: 'Pharmacy A', rx: true, status: 'low' },
  { id: 'med-004', name: 'Amoxicillin 500mg', generic: 'Amoxicillin', category: 'Antibiotic', price: 65, qty: 320, location: 'Pharmacy C', rx: true, status: 'available' },
  { id: 'med-005', name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', category: 'Antihistamine', price: 18, qty: 0, location: 'Pharmacy A', rx: false, status: 'out' },
  { id: 'med-006', name: 'Pantoprazole 40mg', generic: 'Pantoprazole', category: 'Antacid', price: 42, qty: 180, location: 'Pharmacy B', rx: true, status: 'available' },
  { id: 'med-007', name: 'Metformin 500mg', generic: 'Metformin HCl', category: 'Antidiabetic', price: 35, qty: 22, location: 'Pharmacy C', rx: true, status: 'low' },
  { id: 'med-008', name: 'Vitamin D3 1000IU', generic: 'Cholecalciferol', category: 'Supplement', price: 55, qty: 600, location: 'Pharmacy A', rx: false, status: 'available' },
  { id: 'med-009', name: 'Amlodipine 5mg', generic: 'Amlodipine', category: 'Antihypertensive', price: 48, qty: 95, location: 'Pharmacy B', rx: true, status: 'available' },
  { id: 'med-010', name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Antacid', price: 38, qty: 0, location: 'Pharmacy C', rx: false, status: 'out' },
  { id: 'med-011', name: 'ORS Sachet', generic: 'Oral Rehydration Salts', category: 'Supplement', price: 8, qty: 1200, location: 'Pharmacy A', rx: false, status: 'available' },
  { id: 'med-012', name: 'Aspirin 75mg', generic: 'Acetylsalicylic Acid', category: 'Analgesic', price: 22, qty: 480, location: 'Pharmacy B', rx: false, status: 'available' },
  { id: 'med-013', name: 'Dolo 650mg', generic: 'Paracetamol', category: 'Analgesic', price: 18, qty: 300, location: 'Pharmacy A', rx: false, status: 'available' },
  { id: 'med-014', name: 'Saridon', generic: 'Paracetamol + Propyphenazone + Caffeine', category: 'Analgesic', price: 25, qty: 120, location: 'Pharmacy B', rx: false, status: 'available' },
  { id: 'med-015', name: 'Famotidine 20mg', generic: 'Famotidine', category: 'Antacid', price: 16, qty: 160, location: 'Pharmacy C', rx: false, status: 'available' },
  { id: 'med-016', name: 'Antacid Suspension 200ml', generic: 'Aluminium Hydroxide + Magnesium Hydroxide', category: 'Antacid', price: 85, qty: 90, location: 'Pharmacy B', rx: false, status: 'available' },
  { id: 'med-017', name: 'ORS Sachets', generic: 'Oral Rehydration Salts', category: 'Supplement', price: 8, qty: 240, location: 'Pharmacy A', rx: false, status: 'available' },
  { id: 'med-018', name: 'Vitamin C 500mg', generic: 'Ascorbic Acid', category: 'Supplement', price: 12, qty: 180, location: 'Pharmacy C', rx: false, status: 'available' },
  { id: 'med-019', name: 'Clotrimazole 1% Cream 15g', generic: 'Clotrimazole', category: 'Antifungal', price: 48, qty: 75, location: 'Pharmacy A', rx: false, status: 'available' },
  { id: 'med-020', name: 'Diclofenac Gel 30g', generic: 'Diclofenac Diethylamine', category: 'Topical', price: 95, qty: 65, location: 'Pharmacy B', rx: false, status: 'available' },
  { id: 'med-021', name: 'Mupirocin 2% Ointment 5g', generic: 'Mupirocin', category: 'Topical', price: 75, qty: 40, location: 'Pharmacy C', rx: true, status: 'available' },
];

const categoryOptions = ['All Categories', 'Analgesic', 'Antibiotic', 'Antacid', 'Antidiabetic', 'Antihistamine', 'Antihypertensive', 'Supplement', 'Anti-inflammatory', 'Antifungal', 'Topical'];

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: '🟢 Available', className: 'status-available' },
  low: { label: '🟡 Low Stock', className: 'status-low' },
  out: { label: '🔴 Out of Stock', className: 'status-out' },
};

export default function QuickSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [availOnly, setAvailOnly] = useState(false);
  const [rxFilter, setRxFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [requestMessage, setRequestMessage] = useState('');

  const requestMedicine = (medicine: (typeof medicines)[number]) => {
    const session = getStoredSession();
    if (!session) {
      window.location.href = '/sign-up-login-screen';
      return;
    }
    const id = `request-${Date.now()}`;
    addAdminRequest({
      id,
      type: 'Medicine',
      patientName: session.name || session.email.split('@')[0],
      item: medicine.name,
      quantity: '1 pack',
      hospital: 'Public Medicine Request',
      priority: 'Normal',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      contact: session.email,
      requesterEmail: session.email,
    });
    recordAdminActivity({ category: 'request', tone: 'info', message: `Medicine request submitted for ${medicine.name} by ${session.name || session.email}.` });
    setRequestMessage(`Request submitted for ${medicine.name}. Track it from My Purchase Orders in the sidebar.`);
  };

  const filtered = medicines.filter((m) => {
    const matchQ = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.generic.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === 'All Categories' || m.category === category;
    const matchAvail = !availOnly || m.status !== 'out';
    const matchRx = rxFilter === 'all' || (rxFilter === 'yes' ? m.rx : !m.rx);
    return matchQ && matchCat && matchAvail && matchRx;
  });

  return (
    <section id="supplies" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {requestMessage && (
          <p role="status" className="mb-4 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{requestMessage}</p>
        )}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">Medicine Search</h2>
          <p className="text-muted-foreground">Search our formulary of 248+ medicines by name, generic name, or category</p>
        </div>

        {/* Search + Filters */}
        <div className="card-base p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or generic name..."
                className="input-field pl-10"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-field md:w-52"
            >
              {categoryOptions.map((c) => (
                <option key={`cat-${c}`} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={rxFilter}
              onChange={(e) => setRxFilter(e.target.value as 'all' | 'yes' | 'no')}
              className="select-field md:w-44"
            >
              <option value="all">All — Rx & OTC</option>
              <option value="yes">Prescription Only</option>
              <option value="no">OTC (No Rx)</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={availOnly}
                onChange={(e) => setAvailOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary"
              />
              <span className="text-sm text-foreground">In stock only</span>
            </label>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {medicines.length} medicines
          </p>
          {(query || category !== 'All Categories' || availOnly || rxFilter !== 'all') && (
            <button
              onClick={() => { setQuery(''); setCategory('All Categories'); setAvailOnly(false); setRxFilter('all'); }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Results table */}
        {filtered.length === 0 ? (
          <div className="card-base p-12 text-center">
            <Pill size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">No medicines found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or removing filters</p>
          </div>
        ) : (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="table-header-cell">Medicine</th>
                    <th className="table-header-cell">Generic Name</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell">Price</th>
                    <th className="table-header-cell">Qty</th>
                    <th className="table-header-cell">Location</th>
                    <th className="table-header-cell">Rx</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Request</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((med) => {
                    const cfg = statusConfig[med.status];
                    return (
                      <tr key={med.id} className="table-row-hover fade-in">
                        <td className="table-cell font-medium">{med.name}</td>
                        <td className="table-cell text-muted-foreground">{med.generic}</td>
                        <td className="table-cell">
                          <span className="badge-base bg-secondary text-primary">{med.category}</span>
                        </td>
                        <td className="table-cell tabular-nums font-medium">₹{med.price}</td>
                        <td className="table-cell tabular-nums">{med.qty}</td>
                        <td className="table-cell text-muted-foreground">{med.location}</td>
                        <td className="table-cell">
                          {med.rx ? (
                            <span className="badge-base bg-purple-50 text-purple-700 border border-purple-200">Rx</span>
                          ) : (
                            <span className="badge-base bg-muted text-muted-foreground">OTC</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className={`badge-base ${cfg.className}`}>{cfg.label}</span>
                        </td>
                        <td className="table-cell">
                          <button type="button" onClick={() => requestMedicine(med)} className="text-xs font-semibold text-primary hover:underline">
                            Request
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}