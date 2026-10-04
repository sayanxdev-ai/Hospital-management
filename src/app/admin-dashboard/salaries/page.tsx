'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import SalarySection from '../components/SalarySection';

export default function SalariesPage() {
  return (
    <AdminLayout activeSection="salaries">
      <SalarySection />
    </AdminLayout>
  );
}
