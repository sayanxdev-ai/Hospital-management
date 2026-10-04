'use client';
import React, { useState } from 'react';
import { AlertTriangle, Droplets, Pill, Package, X, ChevronRight, Phone } from 'lucide-react';

export type QuickPurchaseTarget = {
  type: 'medicine' | 'blood' | 'supplies';
  title: string;
  quantity: number;
  vendor: string;
  urgent?: boolean;
  availability?: 'Available' | 'Out of Stock';
};

interface AlertsPanelProps {
  onQuickAction?: (target: QuickPurchaseTarget) => void;
}

const alerts = [
  {
    id: 'alert-001',
    type: 'danger',
    icon: Droplets,
    title: 'AB− Blood Critical',
    desc: '0 units remaining — emergency request pending',
    time: '5 min ago',
    action: 'View Request',
  },
  {
    id: 'alert-002',
    type: 'danger',
    icon: Pill,
    title: 'Cetirizine 10mg — Out of Stock',
    desc: 'Quantity: 0 · 3 pending requests',
    time: '18 min ago',
    action: 'Restock',
  },
  {
    id: 'alert-003',
    type: 'warning',
    icon: Pill,
    title: 'Azithromycin 500mg — Low',
    desc: '45 units remaining · threshold: 50',
    time: '32 min ago',
    action: 'Update Stock',
  },
  {
    id: 'alert-004',
    type: 'warning',
    icon: Droplets,
    title: 'A− Blood Low',
    desc: '48 units — below safe threshold of 60',
    time: '1 hr ago',
    action: 'Find Donors',
  },
  {
    id: 'alert-005',
    type: 'warning',
    icon: Package,
    title: 'Surgical Gloves — Low Stock',
    desc: '120 pairs · minimum: 200',
    time: '2 hr ago',
    action: 'Order More',
  },
  {
    id: 'alert-006',
    type: 'warning',
    icon: Pill,
    title: 'Metformin 500mg — Low',
    desc: '22 units · 8 active prescriptions',
    time: '3 hr ago',
    action: 'Update Stock',
  },
];

export default function AlertsPanel({ onQuickAction }: AlertsPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts?.filter(a => !dismissed?.has(a?.id));

  const handleAlertAction = (alert: (typeof alerts)[number]) => {
    if (!onQuickAction) return;

    const title = alert.title.replace(/\s+-\s+.*$/, '').trim();
    const type = alert.icon === Droplets ? 'blood' : 'medicine';
    const quantity = type === 'blood' ? 20 : 50;

    onQuickAction({
      type,
      title,
      quantity,
      vendor: type === 'blood' ? 'City Blood Centre' : 'MediConnect Supplier Hub',
      urgent: alert.type === 'danger',
      availability: alert.title.includes('Out of Stock') || alert.desc.includes('0 units') ? 'Out of Stock' : 'Available',
    });
  };

  return (
    <div className="card-base p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header flex items-center gap-2">
          <AlertTriangle size={18} className="text-warning" />
          Active Alerts
        </h3>
        <div className="flex items-center gap-2">
          <a
            href="tel:8625077254"
            className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:text-danger/80"
            title="Emergency call"
          >
            <Phone size={12} />
            Emergency
          </a>
          <span className="badge-base bg-danger/10 text-danger tabular-nums">
            {visible?.filter(a => a?.type === 'danger')?.length} critical
          </span>
        </div>
      </div>
      {visible?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={22} className="text-success" />
          </div>
          <p className="font-semibold text-foreground text-sm mb-1">All clear</p>
          <p className="text-xs text-muted-foreground">No active alerts at this time</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2.5">
          {visible?.map((alert) => (
            <div
              key={alert?.id}
              className={`rounded-xl p-3.5 border relative group ${
                alert?.type === 'danger' ?'bg-danger/5 border-danger/20' :'bg-warning/5 border-warning/20'
              }`}
            >
              <button
                onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
                className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                aria-label="Dismiss alert"
              >
                <X size={14} />
              </button>
              <div className="flex items-start gap-3 pr-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  alert?.type === 'danger' ? 'bg-danger/15' : 'bg-warning/15'
                }`}>
                  <alert.icon size={16} className={alert?.type === 'danger' ? 'text-danger' : 'text-warning'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug">{alert?.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{alert?.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{alert?.time}</span>
                    <button
                      type="button"
                      onClick={() => handleAlertAction(alert)}
                      className={`text-xs font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all ${
                        alert?.type === 'danger' ? 'text-danger' : 'text-warning'
                      }`}
                    >
                      {alert?.action}
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}