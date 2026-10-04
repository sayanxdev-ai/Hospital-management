'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import DepartmentAnalyticsSection from '../components/DepartmentAnalyticsSection';

export default function DepartmentAnalyticsPage() {
  return (
    <AdminLayout activeSection="department-analytics">
      <DepartmentAnalyticsSection />
    </AdminLayout>
  );
}
