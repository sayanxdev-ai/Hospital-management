'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Bell, Search, RefreshCw, ChevronDown, X } from 'lucide-react';
import { ADMIN_ACTIVITY_CHANGED, deleteAdminActivity, formatActivityTime, getAdminActivities, type AdminActivity } from '../lib/activityStorage';
import { getSessionDisplay, type AuthSession } from '@/lib/auth';

interface AdminTopbarProps {
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
  sidebarCollapsed: boolean;
  activeSection?: string;
  session: AuthSession | null;
}

const sectionLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  activity: 'Activity Log',
  medicines: 'Medicines',
  blood: 'Blood Bank',
  supplies: 'Medical Supplies',
  patients: 'Patients',
  doctors: 'Doctors',
  'blood-requests': 'Blood Requests',
  requests: 'Requests',
  'department-analytics': 'Department Analytics',
  salaries: 'Salaries & Holidays',
  users: 'User Management',
  settings: 'Settings',
};

export default function AdminTopbar({ onToggleSidebar, onMobileMenuOpen, sidebarCollapsed, activeSection = 'dashboard', session }: AdminTopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminActivity[]>([]);
  const userDisplay = getSessionDisplay(session);

  React.useEffect(() => {
    const refreshNotifications = () => setNotifications(getAdminActivities());
    refreshNotifications();
    window.addEventListener(ADMIN_ACTIVITY_CHANGED, refreshNotifications);
    window.addEventListener('storage', refreshNotifications);
    return () => {
      window.removeEventListener(ADMIN_ACTIVITY_CHANGED, refreshNotifications);
      window.removeEventListener('storage', refreshNotifications);
    };
  }, []);

  const pageLabel = sectionLabels[activeSection] || 'Dashboard';

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 z-30">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex btn-icon text-muted-foreground"
        aria-label="Toggle sidebar"
        suppressHydrationWarning
      >
        <Menu size={20} />
      </button>
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden btn-icon text-muted-foreground"
        aria-label="Open menu"
        suppressHydrationWarning
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Admin</span>
        <ChevronDown size={14} className="text-muted-foreground -rotate-90" />
        <span className="font-semibold text-foreground">{pageLabel}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patients, medicines..."
          className="pl-9 pr-4 py-2 w-64 rounded-lg border border-border bg-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          suppressHydrationWarning
        />
      </div>

      {/* Refresh */}
      <button className="btn-icon text-muted-foreground" title="Refresh data" suppressHydrationWarning>
        <RefreshCw size={18} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="btn-icon text-muted-foreground relative"
          aria-label="Notifications"
          suppressHydrationWarning
        >
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
              {notifications.length > 99 ? '99+' : notifications.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 card-base shadow-card-lg z-50 fade-in overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
              <span className="badge-base bg-danger/10 text-danger">{notifications.length} total</span>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-border">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-start gap-2 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      n.tone === 'danger' ? 'bg-danger' :
                      n.tone === 'warning' ? 'bg-warning' :
                      n.tone === 'success' ? 'bg-success' : 'bg-info'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground leading-snug">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatActivityTime(n.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAdminActivity(n.id)}
                    className="btn-icon h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-danger"
                    aria-label={`Delete notification: ${n.message}`}
                    title="Delete notification"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-border text-center">
              <Link href="/admin-dashboard/activity" onClick={() => setNotifOpen(false)} className="text-xs text-primary font-medium hover:underline">See all notifications</Link>
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
          {userDisplay.initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-foreground leading-none">{userDisplay.name}</p>
          <p className="text-xs text-muted-foreground">{userDisplay.roleLabel}</p>
        </div>
      </div>
    </header>
  );
}