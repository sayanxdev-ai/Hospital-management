import React, { useRef, useState } from 'react';
import { ArrowRight, Droplets, Package, Phone } from 'lucide-react';
import KPIBentoGrid from './KPIBentoGrid';
import DashboardCharts from './DashboardCharts';
import RecentRequestsTable from './RecentRequestsTable';
import AlertsPanel, { type QuickPurchaseTarget } from './AlertsPanel';
import ActivityFeed from './ActivityFeed';
import { addAdminRequest, type StockAvailability } from '../lib/adminData';
import { recordAdminActivity } from '../lib/activityStorage';

const orderItems: Record<QuickPurchaseTarget['type'], string[]> = {
  medicine: [
    'Paracetamol 500mg', 'Ibuprofen 400mg', 'Cetirizine 10mg', 'Azithromycin 500mg',
    'Amoxicillin 500mg', 'Pantoprazole 40mg', 'Omeprazole 20mg', 'Metformin 500mg',
    'Amlodipine 5mg', 'Aspirin 75mg', 'Insulin Glargine', 'Salbutamol Inhaler',
    'Vitamin D3 60000IU', 'Vitamin B12 500mcg', 'Ondansetron 4mg',
  ],
  blood: ['A+ Blood', 'A− Blood', 'B+ Blood', 'B− Blood', 'AB+ Blood', 'AB− Blood', 'O+ Blood', 'O− Blood'],
  supplies: [
    'Surgical Gloves (M)', 'Examination Gloves (L)', 'N95 Face Masks', 'Surgical Face Masks',
    '5ml Syringes', 'IV Sets', 'Cotton Rolls 500g', 'Gauze Bandages 4"',
    'Digital Thermometers', 'Oxygen Masks (Adult)', 'PPE Kits', 'Alcohol Swabs (100pk)',
    'IV Cannula 20G', 'Urine Bags 2L', 'Kidney Trays (SS)',
  ],
};

const orderVendors: Record<QuickPurchaseTarget['type'], string[]> = {
  medicine: ['MediConnect Supplier Hub', 'Cipla', 'Sun Pharma', 'Dr. Reddy\'s', 'Alkem', 'Zydus', 'USV', 'Bayer', 'Sanofi', 'GSK', 'Mankind', 'Abbott'],
  blood: ['City Blood Centre', 'Red Cross Mumbai', 'Apollo Blood Bank', 'Lifeline Blood Bank', 'Sanjivani Blood Centre', 'National Blood Bank', 'Red Cross Delhi', 'Fortis Blood Bank', 'Care Blood Centre'],
  supplies: ['Medical Supply Store', 'MediConnect Supplier Hub'],
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
  const [orderQty, setOrderQty] = useState<number>(50);
  const [orderAvailability, setOrderAvailability] = useState<StockAvailability>('Available');
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleQuickAction = (target: QuickPurchaseTarget) => {
    setPurchase(target);
    setOrderQty(target.quantity);
    setOrderAvailability(target.availability ?? 'Available');
    setPurchaseMessage(null);
    setTimeout(() => purchaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleSubmitPurchase = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!purchase) return;

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
    addAdminRequest({
      id: `purchase-${Date.now()}`,
      type: itemType,
      source: 'staff-purchase',
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
      message: `${itemType} order submitted: ${orderQty} ${purchase.type === 'blood' ? 'bags' : 'units'} of ${purchase.title} from ${purchase.vendor} (${orderAvailability}).`,
    });
    setPurchaseMessage({ text: `${itemType} purchase request sent to ${purchase.vendor}.`, type: 'success' });
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
              onClick={() => { setPurchase({ type: 'medicine', title: 'Paracetamol 500mg', quantity: 50, vendor: 'MediConnect Supplier Hub', urgent: false }); setOrderQty(50); setOrderAvailability('Available'); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Package size={16} className="text-primary" />
              Buy Medicine
            </button>
            <button
              type="button"
              onClick={() => { setPurchase({ type: 'blood', title: 'A+ Blood', quantity: 10, vendor: 'City Blood Centre', urgent: true }); setOrderQty(10); setOrderAvailability('Available'); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Droplets size={16} className="text-danger" />
              Buy Blood
            </button>
            <button
              type="button"
              onClick={() => { setPurchase({ type: 'supplies', title: 'Surgical Gloves (M)', quantity: 10, vendor: 'Medical Supply Store' }); setOrderQty(10); setOrderAvailability('Available'); }}
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
          <form onSubmit={handleSubmitPurchase} className="mt-5 grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.8fr_auto] lg:items-end">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Item</label>
              <select
                value={purchase.title}
                onChange={event => setPurchase(prev => prev ? { ...prev, title: event.target.value } : prev)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {itemOptions.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quantity</label>
              <input
                type="number"
                min={purchase.type === 'medicine' ? 50 : 10}
                value={orderQty}
                onChange={event => setOrderQty(Number(event.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Stock availability</label>
              <select
                value={orderAvailability}
                onChange={event => setOrderAvailability(event.target.value as StockAvailability)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Vendor</label>
              <select
                value={purchase.vendor}
                onChange={event => setPurchase((prev: QuickPurchaseTarget | null) => prev ? { ...prev, vendor: event.target.value } : prev)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {vendorOptions.map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap">
              Submit Order
              <ArrowRight size={14} />
            </button>
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