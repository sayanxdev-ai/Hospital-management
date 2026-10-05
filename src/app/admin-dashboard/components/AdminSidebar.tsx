'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Pill, Droplets, Package, Users, FileText, ClipboardList, Settings, LogOut, X, ChevronRight, Activity, Stethoscope, ChartNoAxesCombined } from 'lucide-react';
import { ADMIN_DATA_CHANGED, getAdminBadgeCounts, INITIAL_ADMIN_BADGE_COUNTS } from '../lib/adminData';
import { getSessionDisplay, type AuthSession } from '@/lib/auth';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin-dashboard', key: 'dashboard', badge: null },
      { icon: Activity, label: 'Activity Log', href: '/admin-dashboard/activity', key: 'activity', badge: null },
      { icon: Package, label: 'My Requests & Orders', href: '/admin-dashboard/my-orders', key: 'my-orders', badge: null },
    ]
  },
  {
    label: 'Medical Resources',
    items: [
      { icon: Pill, label: 'Medicines', href: '/admin-dashboard/medicines', key: 'medicines' },
      { icon: Droplets, label: 'Blood Bank', href: '/admin-dashboard/blood-bank', key: 'blood' },
      { icon: Package, label: 'Supplies', href: '/admin-dashboard/supplies', key: 'supplies' },
    ]
  },
  {
    label: 'Patients & Requests',
    items: [
      { icon: Users, label: 'Patients', href: '/admin-dashboard/patients', key: 'patients', badge: null },
      { icon: Stethoscope, label: 'Find a Doctor', href: '/admin-dashboard/doctors', key: 'doctors', badge: null },
      { icon: FileText, label: 'Blood Requests', href: '/admin-dashboard/requests', key: 'blood-requests' },
      { icon: ClipboardList, label: 'Medicine Requests', href: '/admin-dashboard/requests', key: 'requests' },
    ]
  },
  {
    label: 'Administration',
    items: [
      { icon: ChartNoAxesCombined, label: 'Department Analytics', href: '/admin-dashboard/department-analytics', key: 'department-analytics', badge: null },
      { icon: FileText, label: 'Salaries & Holidays', href: '/admin-dashboard/salaries', key: 'salaries', badge: null },
      { icon: Users, label: 'User Management', href: '/admin-dashboard/users', key: 'users', badge: null },
      { icon: Settings, label: 'Settings', href: '/admin-dashboard/settings', key: 'settings', badge: null },
    ]
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  activeSection?: string;
  isAdmin?: boolean;
  session: AuthSession | null;
}

export default function AdminSidebar({ collapsed, mobileOpen, onClose, activeSection = 'dashboard', isAdmin = false, session }: AdminSidebarProps) {
  const [badgeCounts, setBadgeCounts] = useState(INITIAL_ADMIN_BADGE_COUNTS);
  const userDisplay = getSessionDisplay(session);

  useEffect(() => {
    const refreshBadgeCounts = () => setBadgeCounts(getAdminBadgeCounts());
    refreshBadgeCounts();
    window.addEventListener(ADMIN_DATA_CHANGED, refreshBadgeCounts);
    window.addEventListener('storage', refreshBadgeCounts);
    return () => {
      window.removeEventListener(ADMIN_DATA_CHANGED, refreshBadgeCounts);
      window.removeEventListener('storage', refreshBadgeCounts);
    };
  }, []);

  const getBadgeCount = (key: string) => ({
    medicines: badgeCounts.outOfStockMedicines,
    blood: badgeCounts.outOfStockBlood,
    supplies: badgeCounts.outOfStockSupplies,
    'blood-requests': badgeCounts.pendingBloodRequests,
    requests: badgeCounts.pendingMedicineRequests,
  }[key] ?? 0);

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border sidebar-transition
        ${collapsed ? 'w-16' : 'w-60'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className={`flex items-center h-16 px-4 border-b border-border flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <AppLogo size={28} />
            <span className="font-bold text-base text-foreground">MediConnect</span>
          </div>
        )}
        {collapsed && <AppLogo size={28} />}
        <button
          onClick={onClose}
          className="lg:hidden btn-icon text-muted-foreground"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        {navGroups.map((group) => {
          const items = group.label === 'Administration' && !isAdmin
            ? group.items.filter(item => !['department-analytics', 'salaries', 'users', 'settings'].includes(item.key))
            : group.items;
          if (items.length === 0) return null;
          return (
            <div key={`group-${group.label}`} className="mb-4">
              {!collapsed && (
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  {group.label}
                </p>
              )}
              {items.map((item) => {
                const isActive = activeSection === item.key;
                const badgeCount = getBadgeCount(item.key);
                return (
                  <Link
                    key={`nav-item-${item.label}`}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group relative
                    ${isActive
                      ? 'nav-active' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center tabular-nums">
                            {badgeCount}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badgeCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors mb-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {userDisplay.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userDisplay.name}</p>
              <p className="text-xs text-muted-foreground">{userDisplay.roleLabel}</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold mx-auto mb-2">
            {userDisplay.initials}
          </div>
        )}
        <Link
          href="/sign-up-login-screen"
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}