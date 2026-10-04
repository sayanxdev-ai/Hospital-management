import React from 'react';
import { Pill, Droplets, Package, Users } from 'lucide-react';

const stats = [
  { icon: Pill, label: 'Medicines Available', value: '248', unit: 'items', color: 'text-primary' },
  { icon: Droplets, label: 'Blood Units', value: '1,248', unit: 'units', color: 'text-danger' },
  { icon: Package, label: 'Medical Supplies', value: '312', unit: 'items', color: 'text-accent' },
  { icon: Users, label: 'Patients Served', value: '4,820', unit: 'this month', color: 'text-warning' },
];

export default function StatsBar() {
  return (
    <section className="bg-card border-b border-border shadow-card">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {stats?.map((stat) => (
            <div key={`stat-${stat?.label}`} className="flex items-center gap-4 px-6 py-5">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${stat?.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat?.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat?.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}