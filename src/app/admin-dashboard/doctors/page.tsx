'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import DoctorsSection from '../components/DoctorsSection';

export default function DoctorsPage() {
  return (
    <AdminLayout activeSection="doctors">
      <DoctorsSection />
    </AdminLayout>
  );
}