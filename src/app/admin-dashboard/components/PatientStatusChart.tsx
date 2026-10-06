'use client';
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ADMIN_PATIENTS_CHANGED, getPatientCareRecords } from '../lib/patientStorage';

const statusColors: Record<string, string> = {
  Admitted: '#3b82f6',
  'Under Treatment': '#8b5cf6',
  Emergency: '#ef4444',
  Transferred: '#f59e0b',
  Discharged: '#22c55e',
};

function getPatientStatusData() {
  const records = getPatientCareRecords();
  return Object.entries(statusColors).map(([name, color]) => ({
    name,
    color,
    value: records.filter(patient => patient.status === name).length,
  }));
}

const CustomTooltip = ({ active, payload, total }: { active?: boolean; total: number; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (!active || !payload?.length) return null;
  const pct = total ? ((payload[0].value / total) * 100).toFixed(1) : '0.0';
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-md text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: payload[0].payload.color }} />
        <span className="font-semibold text-foreground">{payload[0].name}</span>
      </div>
      <p className="text-muted-foreground">Patients: <span className="font-bold text-foreground tabular-nums">{payload[0].value}</span></p>
      <p className="text-muted-foreground">Share: <span className="font-medium text-foreground">{pct}%</span></p>
    </div>
  );
};

export default function PatientStatusChart() {
  const [patientData, setPatientData] = useState(getPatientStatusData);
  const total = patientData.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    const refreshPatients = () => setPatientData(getPatientStatusData());
    refreshPatients();
    window.addEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
    window.addEventListener('storage', refreshPatients);
    return () => {
      window.removeEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
      window.removeEventListener('storage', refreshPatients);
    };
  }, []);

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Patient Status Distribution</p>
        <p className="text-xs text-muted-foreground">Live status distribution · {total} current patient records</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ResponsiveContainer width={220} height={220}>
          <PieChart>
            <Pie
              data={patientData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={96}
              paddingAngle={3}
              dataKey="value"
            >
              {patientData.map((entry, index) => (
                <Cell key={`patient-cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 flex-1">
          {patientData.map((d) => (
            <div key={`patient-legend-${d.name}`} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-sm text-muted-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground tabular-nums">{d.value}</span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {total ? ((d.value / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}