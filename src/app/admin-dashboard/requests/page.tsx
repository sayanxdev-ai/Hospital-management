'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import RequestsSection from '../components/RequestsSection';

export default function RequestsPage() {
  return (
    <AdminLayout activeSection="requests">
      <RequestsSection />
    </AdminLayout>
  );
}
