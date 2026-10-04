'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const trendData = [
  { day: 'Aug 18', medicine: 8, blood: 3 },
  { day: 'Aug 19', medicine: 14, blood: 5 },
  { day: 'Aug 20', medicine: 10, blood: 2 },
  { day: 'Aug 21', medicine: 19, blood: 7 },
  { day: 'Aug 22', medicine: 12, blood: 4 },
  { day: 'Aug 23', medicine: 22, blood: 6 },
  { day: 'Aug 24', medicine: 17, blood: 5 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-md text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <p key={`tt-${p.name}`} className="text-muted-foreground">
          {p.name}: <span className="font-bold tabular-nums" style={{ color: p.color }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function RequestsTrendChart() {
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Requests — Last 7 Days</p>
        <p className="text-xs text-muted-foreground">Medicine and blood request volume trend</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradMedicine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradBlood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-sans)' }} />
          <Area type="monotone" dataKey="medicine" name="Medicine Requests" stroke="var(--primary)" strokeWidth={2} fill="url(#gradMedicine)" dot={{ r: 3, fill: 'var(--primary)' }} />
          <Area type="monotone" dataKey="blood" name="Blood Requests" stroke="var(--danger)" strokeWidth={2} fill="url(#gradBlood)" dot={{ r: 3, fill: 'var(--danger)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}