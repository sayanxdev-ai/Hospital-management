'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import UsersSection from '../components/UsersSection';

export default function UsersPage() {
  return (
    <AdminLayout activeSection="users">
      <UsersSection />
    </AdminLayout>
  );
}
