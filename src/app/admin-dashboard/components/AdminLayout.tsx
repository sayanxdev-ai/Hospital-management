'use client';
import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { useRouter } from 'next/navigation';
import { getStoredSession, type AuthSession } from '@/lib/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

export default function AdminLayout({ children, activeSection = 'dashboard' }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const router = useRouter();
  const adminOnlySections = ['department-analytics', 'salaries', 'users', 'settings'];
  const requiresAdmin = adminOnlySections.includes(activeSection);

  useEffect(() => {
    const session = getStoredSession();
    const hasAdminAccess = session?.role?.toLowerCase() === 'admin';
    setSession(session);
    setIsAdmin(hasAdminAccess);
    setSessionChecked(true);
    if (!session) router.replace('/sign-up-login-screen');
    else if (requiresAdmin && !hasAdminAccess) router.replace('/admin-dashboard');
  }, [requiresAdmin, router]);

  if (!sessionChecked || (requiresAdmin && !isAdmin)) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Checking access…</div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        activeSection={activeSection}
        isAdmin={isAdmin}
        session={session}
      />

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <AdminTopbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          activeSection={activeSection}
          session={session}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}