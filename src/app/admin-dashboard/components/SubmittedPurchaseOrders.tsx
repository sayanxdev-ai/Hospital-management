'use client';

import { useEffect, useState } from 'react';
import { ADMIN_DATA_CHANGED, getAdminRequests, type AdminRequest, type RequestType } from '../lib/adminData';

export default function useSubmittedPurchaseOrders(type: RequestType): AdminRequest[] {
  const [orders, setOrders] = useState<AdminRequest[]>([]);

  useEffect(() => {
    const refreshOrders = () => {
      setOrders(getAdminRequests().filter(request =>
        request.type === type &&
        (request.source === 'staff-purchase' || request.patientName === 'Staff Purchase') &&
        request.purchaseStatus !== 'Received'
      ));
    };

    refreshOrders();
    window.addEventListener(ADMIN_DATA_CHANGED, refreshOrders);
    window.addEventListener('storage', refreshOrders);
    return () => {
      window.removeEventListener(ADMIN_DATA_CHANGED, refreshOrders);
      window.removeEventListener('storage', refreshOrders);
    };
  }, [type]);

  return orders;
}
