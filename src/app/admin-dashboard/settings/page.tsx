'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import SettingsSection from '../components/SettingsSection';

export default function SettingsPage() {
  return (
    <AdminLayout activeSection="settings">
      <SettingsSection />
    </AdminLayout>
  );
}
