import React, { useRef, useState } from 'react';
import { ArrowRight, Droplets, Package, Phone } from 'lucide-react';
import KPIBentoGrid from './KPIBentoGrid';
import DashboardCharts from './DashboardCharts';
import RecentRequestsTable from './RecentRequestsTable';
import AlertsPanel, { type QuickPurchaseTarget } from './AlertsPanel';
import ActivityFeed from './ActivityFeed';
import { addAdminRequest } from '../lib/adminData';
import { recordAdminActivity } from '../lib/activityStorage';
import { getStoredSession } from '@/lib/auth';

const orderItems: Record<QuickPurchaseTarget['type'], string[]> = {
  medicine: [
    'Paracetamol 500mg', 'Ibuprofen 400mg', 'Cetirizine 10mg', 'Azithromycin 500mg',
    'Amoxicillin 500mg', 'Pantoprazole 40mg', 'Omeprazole 20mg', 'Metformin 500mg',
    'Amlodipine 5mg', 'Aspirin 75mg', 'Insulin Glargine', 'Salbutamol Inhaler',
    'Vitamin D3 60000IU', 'Vitamin B12 500mcg', 'Ondansetron 4mg',
    'Dolo 650mg', 'Saridon', 'Famotidine 20mg', 'Antacid Suspension 200ml',
    'ORS Sachets', 'Vitamin C 500mg', 'Clotrimazole 1% Cream 15g',
    'Diclofenac Gel 30g', 'Mupirocin 2% Ointment 5g',
  ],
  blood: ['A+ Blood', 'A− Blood', 'B+ Blood', 'B− Blood', 'AB+ Blood', 'AB− Blood', 'O+ Blood', 'O− Blood'],
  supplies: [
    'Surgical Gloves (M)', 'Examination Gloves (L)', 'N95 Face Masks', 'Surgical Face Masks',
    '5ml Syringes', 'IV Sets', 'Cotton Rolls 500g', 'Gauze Bandages 4"',
    'Digital Thermometers', 'Oxygen Masks (Adult)', 'PPE Kits', 'Alcohol Swabs (100pk)',
    'IV Cannula 20G', 'Urine Bags 2L', 'Kidney Trays (SS)',
    'Surgical Scissors (Straight)', 'Surgical Scissors (Curved)',
    'Sterilization Pouches (100pk)', 'Autoclave Indicator Tape',
    'Sterile Dressing Packs', 'Crepe Bandages 10cm', 'Medical Adhesive Tape 2.5cm',
    '2ml Syringes', '10ml Syringes', 'Disposable Surgical Gowns', 'Face Shields',
  ],
};

const orderVendors: Record<QuickPurchaseTarget['type'], string[]> = {
  medicine: ['MediConnect Supplier Hub', 'Cipla', 'Sun Pharma', 'Dr. Reddy\'s', 'Alkem', 'Zydus', 'USV', 'Bayer', 'Sanofi', 'GSK', 'Mankind', 'Abbott'],
  blood: ['City Blood Centre', 'Red Cross Mumbai', 'Apollo Blood Bank', 'Lifeline Blood Bank', 'Sanjivani Blood Centre', 'National Blood Bank', 'Red Cross Delhi', 'Fortis Blood Bank', 'Care Blood Centre'],
  supplies: ['Medical Supply Store', 'MediConnect Supplier Hub', 'Apollo Medicals', 'MedPlus Mart', 'Surgical Stores India', 'Romsons', 'HMD Healthcare', 'BPL Medical Technologies'],
};

async function exportDashboardReport() {
  try {
    const XLSX = await import('xlsx');
    const summary = [
      { 'Metric': 'Currently Admitted', 'Value': 142 },
      { 'Metric': 'Discharged Today', 'Value': 23 },
      { 'Metric': 'Total Medicines', 'Value': 248 },
      { 'Metric': 'Low Stock Alerts', 'Value': 14 },
      { 'Metric': 'Blood Units Available', 'Value': 1248 },
      { 'Metric': 'Pending Requests', 'Value': 17 },
      { 'Metric': 'Medical Supplies', 'Value': 312 },
      { 'Metric': 'Emergency Patients', 'Value': 8 },
      { 'Metric': 'Report Generated', 'Value': new Date()?.toLocaleString('en-IN') },
    ];
    const ws = XLSX?.utils?.json_to_sheet(summary);
    ws['!cols'] = [{ wch: 25 }, { wch: 20 }];
    const wb = XLSX?.utils?.book_new();
    XLSX?.utils?.book_append_sheet(wb, ws, 'Dashboard Summary');
    XLSX?.writeFile(wb, `MediConnect_Dashboard_${new Date()?.toISOString()?.split('T')?.[0]}.xlsx`);
  } catch (e) {
    console.error('Export failed', e);
  }
}

export default function DashboardContent() {
  const purchaseRef = useRef<HTMLDivElement | null>(null);
  const [purchase, setPurchase] = useState<QuickPurchaseTarget | null>(null);
  const [orderQty, setOrderQty] = useState<number | ''>('');
  const [orderAvailability, setOrderAvailability] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleQuickAction = (target: QuickPurchaseTarget) => {
    setPurchase({ ...target, title: '', vendor: '' });
    setOrderQty('');
    setOrderAvailability('');
    setBatchNumber('');
    setExpiryDate('');
    setPurchaseMessage(null);
    setTimeout(() => purchaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleSubmitPurchase = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!purchase) return;

    if (
      !purchase.title ||
      !purchase.vendor ||
      (orderAvailability !== 'Available' && orderAvailability !== 'Out of Stock') ||
      orderQty === ''
    ) {
      setPurchaseMessage({ text: 'Please enter an item, quantity, valid availability, and vendor.', type: 'error' });
      return;
    }
    if (purchase.type !== 'blood' && expiryDate && expiryDate < new Date().toISOString().slice(0, 10)) {
      setPurchaseMessage({ text: 'Expiry date cannot be in the past.', type: 'error' });
      return;
    }

    const minimum = purchase.type === 'medicine' ? 50 : 10;
    if (orderQty < minimum) {
      const itemType = purchase.type === 'medicine' ? 'Medicine' : purchase.type === 'blood' ? 'Blood' : 'Supplies';
      setPurchaseMessage({
        text: `${itemType} order must be at least ${minimum} ${purchase.type === 'blood' ? 'bags' : 'units'} for staff purchase.`,
        type: 'error',
      });
      return;
    }

    const itemType = purchase.type === 'medicine' ? 'Medicine' : purchase.type === 'blood' ? 'Blood' : 'Supplies';
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const purchaseStatus = submitter?.value === 'Draft' ? 'Draft' : 'Pending Approval';
    const session = getStoredSession();
    addAdminRequest({
      id: `purchase-${Date.now()}`,
      type: itemType,
      source: 'staff-purchase',
      purchaseStatus,
      batchNumber,
      expiryDate,
      requesterEmail: session?.email,
      availability: orderAvailability,
      patientName: 'Staff Purchase',
      item: purchase.title,
      quantity: `${orderQty} ${purchase.type === 'blood' ? 'bags' : 'units'}`,
      hospital: purchase.vendor,
      priority: purchase.urgent ? 'Urgent' : 'Normal',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      contact: 'Admin Purchase Center',
    });

    recordAdminActivity({
      category: 'order',
      tone: orderAvailability === 'Out of Stock' ? 'danger' : 'success',
      message: `${itemType} purchase order ${purchaseStatus.toLowerCase()}: ${orderQty} ${purchase.type === 'blood' ? 'bags' : 'units'} of ${purchase.title} from ${purchase.vendor} (${orderAvailability}).`,
    });
    setPurchaseMessage({ text: `${itemType} purchase order saved as ${purchaseStatus}.`, type: 'success' });
  };

  const itemOptions = purchase
    ? [...new Set([...orderItems[purchase.type], purchase.title])]
    : [];
  const vendorOptions = purchase
    ? [...new Set([...orderVendors[purchase.type], purchase.vendor])]
    : [];

  return (
    <div className="space-y-6 fade-in">
      <div
        id="purchase-center"
        ref={purchaseRef}
        className="card-base border border-primary/20 bg-primary/5 p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Staff Purchase Center</p>
            <h2 className="text-xl font-bold text-foreground mt-1">Order medicine, blood, or supplies</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleQuickAction({ type: 'medicine', title: 'Paracetamol 500mg', quantity: 50, vendor: 'MediConnect Supplier Hub', urgent: false })}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Package size={16} className="text-primary" />
              Buy Medicine
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction({ type: 'blood', title: 'A+ Blood', quantity: 10, vendor: 'City Blood Centre', urgent: true })}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Droplets size={16} className="text-danger" />
              Buy Blood
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction({ type: 'supplies', title: 'Surgical Gloves (M)', quantity: 10, vendor: 'Medical Supply Store' })}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Package size={16} className="text-warning" />
              Buy Supplies
            </button>
            <a
              href="tel:8625077254"
              className="inline-flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger"
            >
              <Phone size={16} />
              Emergency Call
            </a>
          </div>
        </div>

        {purchase && (
          <form onSubmit={handleSubmitPurchase} className="mt-5 grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-4 lg:items-end">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Item</label>
              <input
                type="text"
                value={purchase.title}
                onChange={event => setPurchase(prev => prev ? { ...prev, title: event.target.value } : prev)}
                list="purchase-item-options"
                placeholder={purchase.type === 'medicine' ? 'Medicine name...' : purchase.type === 'blood' ? 'Blood type...' : 'Service name...'}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <datalist id="purchase-item-options">
                {itemOptions.filter(Boolean).map(item => <option key={item} value={item} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quantity</label>
              <input
                type="number"
                min={purchase.type === 'medicine' ? 50 : 10}
                value={orderQty}
                onChange={event => setOrderQty(event.target.value === '' ? '' : Number(event.target.value))}
                placeholder="Quantity..."
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Stock availability</label>
              <input
                type="text"
                value={orderAvailability}
                onChange={event => setOrderAvailability(event.target.value)}
                list="purchase-availability-options"
                placeholder="Stock availability..."
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <datalist id="purchase-availability-options">
                <option value="Available" />
                <option value="Out of Stock" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Vendor</label>
              <input
                type="text"
                value={purchase.vendor}
                onChange={event => setPurchase((prev: QuickPurchaseTarget | null) => prev ? { ...prev, vendor: event.target.value } : prev)}
                list="purchase-vendor-options"
                placeholder="Vendor name..."
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <datalist id="purchase-vendor-options">
                {vendorOptions.filter(Boolean).map(vendor => <option key={vendor} value={vendor} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Batch Number</label>
              <input type="text" value={batchNumber} onChange={event => setBatchNumber(event.target.value)} placeholder="Batch number..." className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={event => setExpiryDate(event.target.value)} min={new Date().toISOString().slice(0, 10)} className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-2">
              <button type="submit" value="Draft" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted whitespace-nowrap">
                Save Draft
              </button>
              <button type="submit" value="Pending Approval" className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap">
              Submit Order
              <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
        {purchaseMessage && (
          <p
            role="status"
            className={`mt-3 text-sm font-medium ${purchaseMessage.type === 'success' ? 'text-success' : 'text-danger'}`}
          >
            {purchaseMessage.text}
          </p>
        )}
      </div>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Last updated: 24 Aug 2026, 1:59 PM · Auto-refreshes every 5 min
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="select-field text-sm w-40">
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
          <button onClick={exportDashboardReport} className="btn-primary btn-sm px-4 py-2">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <KPIBentoGrid />

      {/* Charts + Alerts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <AlertsPanel onQuickAction={handleQuickAction} />
        </div>
      </div>

      {/* Requests table + Activity feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentRequestsTable />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}