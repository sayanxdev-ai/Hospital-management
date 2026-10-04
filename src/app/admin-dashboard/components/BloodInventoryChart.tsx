'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

const bloodData = [
  { group: 'A+', units: 312, status: 'available' },
  { group: 'A−', units: 48, status: 'low' },
  { group: 'B+', units: 284, status: 'available' },
  { group: 'B−', units: 22, status: 'low' },
  { group: 'AB+', units: 254, status: 'available' },
  { group: 'AB−', units: 0, status: 'out' },
  { group: 'O+', units: 398, status: 'available' },
  { group: 'O−', units: 76, status: 'available' },
];

const getBarColor = (status: string) => {
  if (status === 'available') return 'var(--primary)';
  if (status === 'low') return 'var(--warning)';
  return 'var(--danger)';
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  const d = bloodData.find(b => b.group === label);
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-md text-sm">
      <p className="font-bold text-foreground mb-1">Blood Group {label}</p>
      <p className="text-muted-foreground">Units available: <span className="font-semibold text-foreground tabular-nums">{payload[0].value}</span></p>
      <p className="text-muted-foreground">Status: <span className={`font-medium ${d?.status === 'available' ? 'text-success' : d?.status === 'low' ? 'text-warning' : 'text-danger'}`}>
        {d?.status === 'available' ? '🟢 Available' : d?.status === 'low' ? '🟡 Low' : '🔴 Out'}
      </span></p>
    </div>
  );
};

export default function BloodInventoryChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-foreground">Blood Group Distribution</p>
          <p className="text-xs text-muted-foreground">Total: 1,248 units across 8 blood groups</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'var(--primary)'}} /> Available</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'var(--warning)'}} /> Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{background:'var(--danger)'}} /> Out</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={bloodData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="group" tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
          <ReferenceLine y={50} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Low threshold', position: 'right', fontSize: 10, fill: 'var(--warning)' }} />
          <Bar dataKey="units" radius={[5, 5, 0, 0]}>
            {bloodData.map((entry) => (
              <Cell key={`cell-blood-${entry.group}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
