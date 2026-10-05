export type RequestStatus = 'Pending' | 'Processing' | 'Available' | 'Completed' | 'Cancelled' | 'Rejected';
export type RequestPriority = 'Normal' | 'Urgent' | 'Emergency';
export type RequestType = 'Medicine' | 'Blood' | 'Supplies';
export type StockAvailability = 'Available' | 'Out of Stock';
export type PurchaseOrderStatus = 'Draft' | 'Pending Approval' | 'Ordered' | 'Received';

export interface AdminRequest {
  id: string;
  type: RequestType;
  source?: 'staff-purchase';
  purchaseStatus?: PurchaseOrderStatus;
  batchNumber?: string;
  expiryDate?: string;
  requesterEmail?: string;
  availability?: StockAvailability;
  patientName: string;
  item: string;
  quantity: string;
  hospital: string;
  priority: RequestPriority;
  status: RequestStatus;
  date: string;
  contact: string;
}

const REQUESTS_STORAGE_KEY = 'mediconnect-admin-requests';
const INVENTORY_COUNTS_STORAGE_KEY = 'mediconnect-admin-inventory-counts';
export const ADMIN_DATA_CHANGED = 'mediconnect-admin-data-changed';

export const INITIAL_ADMIN_REQUESTS: AdminRequest[] = [
  { id: 'req-001', type: 'Blood', patientName: 'Rahul Mehta', item: 'AB−', quantity: '2 units', hospital: 'City Hospital', priority: 'Emergency', status: 'Pending', date: '24 Aug 2026', contact: '+91 98765 43210' },
  { id: 'req-002', type: 'Medicine', patientName: 'Priya Sharma', item: 'Azithromycin 500mg', quantity: '10 tabs', hospital: 'Lifeline Clinic', priority: 'Urgent', status: 'Processing', date: '24 Aug 2026', contact: '+91 87654 32109' },
  { id: 'req-003', type: 'Blood', patientName: 'Suresh Patel', item: 'O+', quantity: '3 units', hospital: 'Apollo Medical', priority: 'Normal', status: 'Available', date: '23 Aug 2026', contact: '+91 76543 21098' },
  { id: 'req-004', type: 'Medicine', patientName: 'Anjali Singh', item: 'Insulin Glargine', quantity: '2 vials', hospital: 'Sanjivani Hospital', priority: 'Urgent', status: 'Pending', date: '23 Aug 2026', contact: '+91 65432 10987' },
  { id: 'req-005', type: 'Blood', patientName: 'Kiran Desai', item: 'B+', quantity: '1 unit', hospital: 'Red Cross Centre', priority: 'Normal', status: 'Completed', date: '22 Aug 2026', contact: '+91 54321 09876' },
  { id: 'req-006', type: 'Medicine', patientName: 'Vikram Nair', item: 'Metformin 500mg', quantity: '30 tabs', hospital: 'City Hospital', priority: 'Normal', status: 'Pending', date: '22 Aug 2026', contact: '+91 43210 98765' },
  { id: 'req-007', type: 'Blood', patientName: 'Meena Joshi', item: 'A+', quantity: '2 units', hospital: 'Lifeline Clinic', priority: 'Urgent', status: 'Processing', date: '22 Aug 2026', contact: '+91 32109 87654' },
  { id: 'req-008', type: 'Medicine', patientName: 'Deepak Rao', item: 'Paracetamol 500mg', quantity: '20 tabs', hospital: 'Apollo Medical', priority: 'Normal', status: 'Completed', date: '21 Aug 2026', contact: '+91 21098 76543' },
  { id: 'req-009', type: 'Blood', patientName: 'Kavita Kulkarni', item: 'O−', quantity: '4 units', hospital: 'Sanjivani Hospital', priority: 'Emergency', status: 'Cancelled', date: '21 Aug 2026', contact: '+91 10987 65432' },
  { id: 'req-010', type: 'Medicine', patientName: 'Arun Tiwari', item: 'Amlodipine 5mg', quantity: '15 tabs', hospital: 'City Hospital', priority: 'Normal', status: 'Rejected', date: '20 Aug 2026', contact: '+91 09876 54321' },
  { id: 'req-011', type: 'Blood', patientName: 'Sunita Verma', item: 'A−', quantity: '2 units', hospital: 'Fortis Hospital', priority: 'Emergency', status: 'Pending', date: '24 Aug 2026', contact: '+91 98001 23456' },
  { id: 'req-012', type: 'Medicine', patientName: 'Ravi Kumar', item: 'Warfarin 5mg', quantity: '30 tabs', hospital: 'Care Hospital', priority: 'Urgent', status: 'Pending', date: '24 Aug 2026', contact: '+91 87001 23456' },
];

export const INITIAL_ADMIN_BADGE_COUNTS = {
  outOfStockMedicines: 2,
  outOfStockSupplies: 2,
  outOfStockBlood: 0,
  pendingBloodRequests: INITIAL_ADMIN_REQUESTS.filter(request => request.type === 'Blood' && request.status === 'Pending').length,
  pendingMedicineRequests: INITIAL_ADMIN_REQUESTS.filter(request => request.type === 'Medicine' && request.status === 'Pending').length,
};

export function getAdminRequests(): AdminRequest[] {
  if (typeof window === 'undefined') return INITIAL_ADMIN_REQUESTS;

  try {
    const stored = window.localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (stored === null) return INITIAL_ADMIN_REQUESTS;
    const requests: unknown = JSON.parse(stored);
    return Array.isArray(requests) ? requests as AdminRequest[] : INITIAL_ADMIN_REQUESTS;
  } catch {
    return INITIAL_ADMIN_REQUESTS;
  }
}

export function saveAdminRequests(requests: AdminRequest[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(new Event(ADMIN_DATA_CHANGED));
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export function addAdminRequest(request: AdminRequest) {
  saveAdminRequests([request, ...getAdminRequests()]);
}

export function updateOutOfStockCount(type: 'medicine' | 'supply', count: number) {
  if (typeof window === 'undefined') return;

  try {
    const stored = window.localStorage.getItem(INVENTORY_COUNTS_STORAGE_KEY);
    const counts = stored ? JSON.parse(stored) as Record<string, number> : {};
    counts[type] = count;
    window.localStorage.setItem(INVENTORY_COUNTS_STORAGE_KEY, JSON.stringify(counts));
    window.dispatchEvent(new Event(ADMIN_DATA_CHANGED));
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export function getAdminBadgeCounts() {
  let inventoryCounts: Record<string, number> = {};

  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(INVENTORY_COUNTS_STORAGE_KEY);
      inventoryCounts = stored ? JSON.parse(stored) as Record<string, number> : {};
    } catch {
      inventoryCounts = {};
    }
  }

  const requests = getAdminRequests();
  const pendingOutOfStockRequests = requests.filter(request =>
    request.availability === 'Out of Stock' &&
    (request.status === 'Pending' || request.status === 'Processing')
  );
  return {
    outOfStockMedicines: (inventoryCounts.medicine ?? INITIAL_ADMIN_BADGE_COUNTS.outOfStockMedicines) +
      pendingOutOfStockRequests.filter(request => request.type === 'Medicine').length,
    outOfStockSupplies: (inventoryCounts.supply ?? INITIAL_ADMIN_BADGE_COUNTS.outOfStockSupplies) +
      pendingOutOfStockRequests.filter(request => request.type === 'Supplies').length,
    outOfStockBlood: pendingOutOfStockRequests.filter(request => request.type === 'Blood').length,
    pendingBloodRequests: requests.filter(request => request.type === 'Blood' && request.status === 'Pending').length,
    pendingMedicineRequests: requests.filter(request => request.type === 'Medicine' && request.status === 'Pending').length,
  };
}