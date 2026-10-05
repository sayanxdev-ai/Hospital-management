'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ADMIN_DATA_CHANGED, getAdminRequests, type AdminRequest } from '../lib/adminData';
import AdminLayout from '../components/AdminLayout';
import { getStoredSession } from '@/lib/auth';

const orderStages = ['Draft', 'Pending Approval', 'Ordered', 'Received'] as const;

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<AdminRequest[]>([]);

  useEffect(() => {
    const refreshOrders = () => {
      const email = getStoredSession()?.email;
      setOrders(email
        ? getAdminRequests().filter(order => order.requesterEmail === email)
        : []);
    };
    refreshOrders();
    window.addEventListener(ADMIN_DATA_CHANGED, refreshOrders);
    window.addEventListener('storage', refreshOrders);
    return () => {
      window.removeEventListener(ADMIN_DATA_CHANGED, refreshOrders);
      window.removeEventListener('storage', refreshOrders);
    };
  }, []);

  return (
    <AdminLayout activeSection="my-orders">
      <div className="space-y-6">
        <div>
          <h1 className="page-title">My Requests & Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track submitted requests and purchase orders.</p>
        </div>
        {orders.length === 0 ? (
          <div className="card-base p-8 text-center">
            <p className="font-semibold text-foreground">No requests or orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Requests you submit will appear here.</p>
            <Link href="/admin-dashboard" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Go to dashboard</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isPurchaseOrder = order.source === 'staff-purchase';
              const stage = isPurchaseOrder ? order.purchaseStatus || 'Pending Approval' : order.status;
              const currentStage = isPurchaseOrder ? orderStages.indexOf(stage as (typeof orderStages)[number]) : -1;
              return (
                <article key={order.id} className="card-base p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-foreground">{order.item}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{order.type} · {order.quantity} · {order.hospital}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Order {order.id} · {order.date}</p>
                    </div>
                    <span className="badge-base bg-secondary text-primary">{stage}</span>
                  </div>
                  {isPurchaseOrder && (
                    <ol aria-label="Purchase order progress" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {orderStages.map((orderStage, index) => (
                        <li key={orderStage} className={`rounded-lg border px-3 py-2 text-center text-xs font-medium ${
                          index <= currentStage ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                        }`}>
                          {orderStage}
                        </li>
                      ))}
                    </ol>
                  )}
                  {(order.batchNumber || order.expiryDate) && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {order.batchNumber ? `Batch ${order.batchNumber}` : ''}
                      {order.batchNumber && order.expiryDate ? ' · ' : ''}
                      {order.expiryDate ? `Expiry ${order.expiryDate}` : ''}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
