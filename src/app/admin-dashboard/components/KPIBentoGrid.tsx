'use client';
import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, Pill, AlertTriangle, Droplets,
  ClipboardList, Package, Ambulance, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { ADMIN_PATIENTS_CHANGED, getPatientCareRecords } from '../lib/patientStorage';

type TrendDir = 'up' | 'down' | 'flat';

interface KPICard {
  id: string;
  title: string;
  value: string | number;
  subValue?: string;
  trend: TrendDir;
  trendLabel: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  iconBg: string;
  iconColor: string;
  span?: 'normal' | 'wide';
  alert?: boolean;
}

const kpiCards: KPICard[] = [
  {
    id: 'kpi-admitted',
    title: 'Active Patients',
    value: 0,
    subValue: '0 emergency',
    trend: 'flat',
    trendLabel: 'Live patient list count',
    icon: Users,
    colorClass: 'text-primary',
    borderClass: 'metric-card-info',
    bgClass: 'bg-card',
    iconBg: 'bg-secondary',
    iconColor: 'text-primary',
    span: 'wide',
  },
  {
    id: 'kpi-discharged',
    title: 'Discharged Today',
    value: 23,
    trend: 'up',
    trendLabel: '+3 vs yesterday',
    icon: UserCheck,
    colorClass: 'text-success',
    borderClass: 'metric-card-positive',
    bgClass: 'bg-card',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  {
    id: 'kpi-medicines',
    title: 'Total Medicines',
    value: 248,
    subValue: '12 categories',
    trend: 'flat',
    trendLabel: 'No change',
    icon: Pill,
    colorClass: 'text-primary',
    borderClass: 'metric-card-info',
    bgClass: 'bg-card',
    iconBg: 'bg-secondary',
    iconColor: 'text-primary',
  },
  {
    id: 'kpi-lowstock',
    title: 'Low Stock Alerts',
    value: 14,
    subValue: '3 out of stock',
    trend: 'up',
    trendLabel: '+2 since morning',
    icon: AlertTriangle,
    colorClass: 'text-danger',
    borderClass: 'metric-card-danger',
    bgClass: 'bg-danger/5',
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    alert: true,
  },
  {
    id: 'kpi-blood',
    title: 'Blood Units Available',
    value: '1,248',
    subValue: 'AB− critically low',
    trend: 'down',
    trendLabel: '-42 this week',
    icon: Droplets,
    colorClass: 'text-danger',
    borderClass: 'metric-card-danger',
    bgClass: 'bg-card',
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
  },
  {
    id: 'kpi-requests',
    title: 'Pending Requests',
    value: 17,
    subValue: '5 blood · 12 medicine',
    trend: 'up',
    trendLabel: '+5 since 8 AM',
    icon: ClipboardList,
    colorClass: 'text-warning',
    borderClass: 'metric-card-warning',
    bgClass: 'bg-warning/5',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    alert: true,
  },
  {
    id: 'kpi-supplies',
    title: 'Medical Supplies',
    value: 312,
    subValue: '7 below minimum',
    trend: 'down',
    trendLabel: '-8 this week',
    icon: Package,
    colorClass: 'text-accent',
    borderClass: 'metric-card-teal',
    bgClass: 'bg-card',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    id: 'kpi-emergency',
    title: 'Emergency Patients',
    value: 0,
    subValue: 'From current patient records',
    trend: 'flat',
    trendLabel: 'Live patient list count',
    icon: Ambulance,
    colorClass: 'text-danger',
    borderClass: 'metric-card-danger',
    bgClass: 'bg-danger/5',
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    alert: true,
  },
];

const TrendIcon = ({ dir }: { dir: TrendDir }) => {
  if (dir === 'up') return <TrendingUp size={13} className="text-success" />;
  if (dir === 'down') return <TrendingDown size={13} className="text-danger" />;
  return <Minus size={13} className="text-muted-foreground" />;
};

export default function KPIBentoGrid() {
  // Grid plan: 8 cards → grid-cols-4
  // Row 1: hero (kpi-admitted spans 2 cols) + 2 regular cards = 4 cols
  // Row 2: 4 regular cards = 4 cols
  // Total: 2 + 1 + 1 + 1 + 1 + 1 + 1 = 8 cards ✓

  const [patientCounts, setPatientCounts] = useState(() => {
    const records = getPatientCareRecords();
    return {
      active: records.filter(patient => patient.status !== 'Discharged' && patient.status !== 'Transferred').length,
      emergency: records.filter(patient => patient.status === 'Emergency').length,
    };
  });

  useEffect(() => {
    const refreshPatients = () => {
      const records = getPatientCareRecords();
      setPatientCounts({
        active: records.filter(patient => patient.status !== 'Discharged' && patient.status !== 'Transferred').length,
        emergency: records.filter(patient => patient.status === 'Emergency').length,
      });
    };
    refreshPatients();
    window.addEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
    window.addEventListener('storage', refreshPatients);
    return () => {
      window.removeEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
      window.removeEventListener('storage', refreshPatients);
    };
  }, []);

  const displayedCards = kpiCards.map(card => {
    if (card.id === 'kpi-admitted') {
      return { ...card, value: patientCounts.active, subValue: `${patientCounts.emergency} emergency` };
    }
    if (card.id === 'kpi-emergency') return { ...card, value: patientCounts.emergency };
    return card;
  });
  const hero = displayedCards[0];
  const rest = displayedCards.slice(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Hero card — spans 2 cols */}
      <div
        className={`col-span-2 card-base ${hero.borderClass} ${hero.bgClass} p-5 ${hero.alert ? 'emergency-pulse' : ''}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{hero.title}</p>
            <p className="text-4xl font-extrabold tabular-nums text-foreground">{hero.value}</p>
            {hero.subValue && <p className="text-sm text-muted-foreground mt-1">{hero.subValue}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl ${hero.iconBg} flex items-center justify-center`}>
            <hero.icon size={24} className={hero.iconColor} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <TrendIcon dir={hero.trend} />
          <span className={hero.trend === 'up' ? 'text-success' : hero.trend === 'down' ? 'text-danger' : ''}>
            {hero.trendLabel}
          </span>
        </div>
      </div>

      {/* Remaining 6 cards — each 1 col */}
      {rest.map((card) => (
        <div
          key={card.id}
          className={`card-base ${card.borderClass} ${card.bgClass} p-5 ${card.alert ? 'animate-pulse-subtle' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{card.title}</p>
            <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
          </div>
          <p className="text-2xl font-extrabold tabular-nums text-foreground mb-0.5">{card.value}</p>
          {card.subValue && <p className="text-xs text-muted-foreground mb-2 truncate">{card.subValue}</p>}
          <div className="flex items-center gap-1 text-xs font-medium">
            <TrendIcon dir={card.trend} />
            <span className={`${card.trend === 'up' && !card.alert ? 'text-success' : card.trend === 'up' && card.alert ? 'text-danger' : card.trend === 'down' ? 'text-danger' : 'text-muted-foreground'}`}>
              {card.trendLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}