'use client';
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import MedicinesSection from '../components/MedicinesSection';

export default function MedicinesPage() {
  return (
    <AdminLayout activeSection="medicines">
      <MedicinesSection />
    </AdminLayout>
  );
}
