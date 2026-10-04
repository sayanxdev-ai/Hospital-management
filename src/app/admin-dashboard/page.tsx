'use client';
import React from 'react';
import AdminLayout from './components/AdminLayout';
import DashboardContent from './components/DashboardContent';

export default function AdminDashboardPage() {
  return (
    <AdminLayout activeSection="dashboard">
      <DashboardContent />
    </AdminLayout>
  );
}