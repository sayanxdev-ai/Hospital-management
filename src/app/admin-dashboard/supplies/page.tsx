'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import SuppliesSection from '../components/SuppliesSection';

export default function SuppliesPage() {
  return (
    <AdminLayout activeSection="supplies">
      <SuppliesSection />
    </AdminLayout>
  );
}
