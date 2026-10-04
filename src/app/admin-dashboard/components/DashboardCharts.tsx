'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const BloodInventoryChart = dynamic(() => import('./BloodInventoryChart'), { ssr: false });
const PatientStatusChart = dynamic(() => import('./PatientStatusChart'), { ssr: false });
const RequestsTrendChart = dynamic(() => import('./RequestsTrendChart'), { ssr: false });

const chartTabs = [
  { id: 'blood', label: 'Blood Inventory' },
  { id: 'patients', label: 'Patient Status' },
  { id: 'requests', label: 'Requests Trend' },
];

export default function DashboardCharts() {
  const [activeTab, setActiveTab] = useState('blood');

  return (
    <div className="card-base p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h3 className="section-header">Analytics</h3>
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          {chartTabs?.map((tab) => (
            <button
              key={`chart-tab-${tab?.id}`}
              onClick={() => setActiveTab(tab?.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                activeTab === tab?.id
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="fade-in">
        {activeTab === 'blood' && <BloodInventoryChart />}
        {activeTab === 'patients' && <PatientStatusChart />}
        {activeTab === 'requests' && <RequestsTrendChart />}
      </div>
    </div>
  );
}