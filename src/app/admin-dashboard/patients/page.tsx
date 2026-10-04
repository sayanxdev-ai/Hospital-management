'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import PatientsSection from '../components/PatientsSection';

export default function PatientsPage() {
  return (
    <AdminLayout activeSection="patients">
      <PatientsSection />
    </AdminLayout>
  );
}
