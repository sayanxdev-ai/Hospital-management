'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ActivityFeed from '../components/ActivityFeed';

export default function ActivityPage() {
  return (
    <AdminLayout activeSection="activity">
      <ActivityFeed showAll />
    </AdminLayout>
  );
}
