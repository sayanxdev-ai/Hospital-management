'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const patientData = [
  { name: 'Admitted', value: 84, color: '#3b82f6' },
  { name: 'Under Treatment', value: 50, color: '#8b5cf6' },
  { name: 'Emergency', value: 8, color: '#ef4444' },
  { name: 'Transferred', value: 12, color: '#f59e0b' },
  { name: 'Discharged', value: 23, color: '#22c55e' },
];

const total = patientData.reduce((s, d) => s + d.value, 0);

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (!active || !payload?.length) return null;
  const pct = ((payload[0].value / total) * 100).toFixed(1);
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
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Patient Status Distribution</p>
        <p className="text-xs text-muted-foreground">Total: {total} patients currently on record</p>
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
            <Tooltip content={<CustomTooltip />} />
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
                  {((d.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}