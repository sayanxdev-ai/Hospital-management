'use client';

import React, { useState } from 'react';
import { Droplets, MapPin, Phone } from 'lucide-react';
import { addAdminRequest } from '@/app/admin-dashboard/lib/adminData';
import { recordAdminActivity } from '@/app/admin-dashboard/lib/activityStorage';
import { getStoredSession } from '@/lib/auth';

const bloodGroups = [
  { group: 'A+', units: 312, banks: 8, status: 'available' },
  { group: 'A-', units: 48, banks: 4, status: 'low' },
  { group: 'B+', units: 284, banks: 7, status: 'available' },
  { group: 'B-', units: 22, banks: 3, status: 'low' },
  { group: 'AB+', units: 254, banks: 6, status: 'available' },
  { group: 'AB-', units: 0, banks: 0, status: 'out' },
  { group: 'O+', units: 398, banks: 9, status: 'available' },
  { group: 'O-', units: 76, banks: 5, status: 'available' },
];

const bloodBanks = [
  { name: 'City Blood Centre', location: 'Andheri, Mumbai', contact: '+91 22-2670-1234', groups: ['A+', 'B+', 'O+', 'AB+'], hours: '24/7' },
  { name: 'Lifeline Blood Bank', location: 'Thane, Mumbai', contact: '+91 22-2540-5678', groups: ['A+', 'A-', 'B+', 'O+'], hours: '8AM–10PM' },
  { name: 'Red Cross Centre', location: 'Dadar, Mumbai', contact: '+91 22-2413-9876', groups: ['B+', 'B-', 'O+', 'O-'], hours: '24/7' },
  { name: 'Sanjivani Blood Bank', location: 'Pune', contact: '+91 20-2550-4321', groups: ['A+', 'AB+', 'O-', 'AB-'], hours: '9AM–9PM' },
];

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  available: { label: 'Available', dot: 'bg-success', badge: 'status-available' },
  low: { label: 'Low Stock', dot: 'bg-warning', badge: 'status-low' },
  out: { label: 'Unavailable', dot: 'bg-danger', badge: 'status-out' },
};

export default function BloodGroupGrid() {
  const [requestMessage, setRequestMessage] = useState('');

  const requestBlood = (group: string) => {
    const session = getStoredSession();
    if (!session) {
      window.location.href = '/sign-up-login-screen';
      return;
    }
    const id = `request-${Date.now()}`;
    addAdminRequest({
      id,
      type: 'Blood',
      patientName: session.name || session.email.split('@')[0],
      item: group,
      quantity: '1 unit',
      hospital: 'Public Blood Request',
      priority: 'Urgent',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      contact: session.email,
      requesterEmail: session.email,
    });
    recordAdminActivity({ category: 'request', tone: 'warning', message: `Blood request submitted for ${group} by ${session.name || session.email}.` });
    setRequestMessage(`Request submitted for ${group}. Track its status in My Requests & Orders.`);
  };

  return (
    <section id="blood-bank" className="py-20 bg-card border-y border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Blood Availability</h2>
            <p className="text-muted-foreground">Real-time blood group availability across registered blood banks</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={`legend-${key}`} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
        {requestMessage && <p role="status" className="mb-4 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{requestMessage}</p>}

        {/* Blood group grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-12">
          {bloodGroups.map((bg) => {
            const cfg = statusConfig[bg.status];
            return (
              <div
                key={`bg-${bg.group}`}
                className={`card-base card-hover p-4 text-center cursor-pointer border-2 ${
                  bg.status === 'available' ? 'border-success/20 hover:border-success/40' :
                  bg.status === 'low'? 'border-warning/20 hover:border-warning/40' : 'border-danger/20 hover:border-danger/40'
                }`}
              >
                <div className={`blood-badge mx-auto mb-2 ${
                  bg.status === 'available' ? 'bg-success/10 text-success border border-success/20' :
                  bg.status === 'low'? 'bg-warning/10 text-warning border border-warning/20' : 'bg-danger/10 text-danger border border-danger/20'
                }`}>
                  {bg.group}
                </div>
                <p className="text-xl font-bold text-foreground tabular-nums mb-0.5">{bg.units}</p>
                <p className="text-xs text-muted-foreground">units</p>
                <button type="button" onClick={() => requestBlood(bg.group)} className="mt-2 text-xs font-semibold text-primary hover:underline">
                  Request blood
                </button>
                <div className={`mt-2 badge-base ${cfg.badge} justify-center w-full`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {bg.status === 'out' ? 'None' : `${bg.banks} banks`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Blood banks list */}
        <div>
          <h3 className="section-header mb-5">Registered Blood Banks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {bloodBanks.map((bank) => (
              <div key={`bank-${bank.name}`} className="card-base p-5 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
                    <Droplets size={18} className="text-danger" />
                  </div>
                  <span className="badge-base status-available text-xs">{bank.hours}</span>
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{bank.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <MapPin size={12} />
                  <span>{bank.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <Phone size={12} />
                  <span>{bank.contact}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {bank.groups.map((g) => (
                    <span key={`bank-${bank.name}-${g}`} className="badge-base bg-danger/10 text-danger border border-danger/20 text-xs">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}