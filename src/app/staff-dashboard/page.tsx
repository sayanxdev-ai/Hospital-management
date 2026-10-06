'use client';
import React from 'react';
import AdminLayout from '../admin-dashboard/components/AdminLayout';
import DashboardContent from '../admin-dashboard/components/DashboardContent';

export default function StaffDashboardPage() {
  return (
    <AdminLayout activeSection="dashboard">
      <DashboardContent />
    </AdminLayout>
  );
}
