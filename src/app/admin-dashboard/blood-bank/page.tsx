'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import BloodBankSection from '../components/BloodBankSection';

export default function BloodBankPage() {
  return (
    <AdminLayout activeSection="blood">
      <BloodBankSection />
    </AdminLayout>
  );
}
