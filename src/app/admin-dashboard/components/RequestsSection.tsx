'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Search, Check, X, Eye, Download } from 'lucide-react';
import { ADMIN_DATA_CHANGED, getAdminRequests, INITIAL_ADMIN_REQUESTS, saveAdminRequests, type AdminRequest, type PurchaseOrderStatus, type RequestPriority, type RequestStatus, type RequestType } from '../lib/adminData';
import { recordAdminActivity } from '../lib/activityStorage';
import { receivePurchaseOrderStock } from '../lib/inventoryStorage';
import PurchaseOrderActions from './PurchaseOrderActions';

type Request = AdminRequest;

const statusConfig: Record<RequestStatus, { className: string }> = {
  Pending: { className: 'bg-warning/10 text-warning border border-warning/20' },
  Processing: { className: 'bg-info/10 text-info border border-info/20' },
  Available: { className: 'bg-success/10 text-success border border-success/20' },
  Completed: { className: 'bg-success/10 text-success border border-success/20' },
  Cancelled: { className: 'bg-muted text-muted-foreground border border-border' },
  Rejected: { className: 'bg-danger/10 text-danger border border-danger/20' },
};

const priorityConfig: Record<RequestPriority, string> = {
  Normal: 'priority-normal',
  Urgent: 'priority-urgent',
  Emergency: 'priority-emergency',
};

export default function RequestsSection() {
  const [requests, setRequests] = useState<Request[]>(INITIAL_ADMIN_REQUESTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | RequestType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | RequestPriority>('All');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'danger' } | null>(null);
  const [viewModal, setViewModal] = useState<Request | null>(null);

  useEffect(() => {
    const syncRequests = () => setRequests(getAdminRequests());
    syncRequests();
    window.addEventListener(ADMIN_DATA_CHANGED, syncRequests);
    window.addEventListener('storage', syncRequests);
    return () => {
      window.removeEventListener(ADMIN_DATA_CHANGED, syncRequests);
      window.removeEventListener('storage', syncRequests);
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'danger' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.id.toLowerCase().includes(q) || r.patientName.toLowerCase().includes(q) || r.item.toLowerCase().includes(q) || r.hospital.toLowerCase().includes(q);
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    return matchSearch && matchType && matchStatus && matchPriority;
  }), [requests, search, typeFilter, statusFilter, priorityFilter]);

  const updateStatus = (id: string, status: RequestStatus) => {
    const changedRequest = requests.find(request => request.id === id);
    const updatedRequests = requests.map(r => r.id === id ? { ...r, status } : r);
    setRequests(updatedRequests);
    saveAdminRequests(updatedRequests);
    if (changedRequest) {
      recordAdminActivity({
        category: 'request',
        tone: status === 'Rejected' ? 'danger' : status === 'Completed' ? 'success' : 'info',
        message: `${changedRequest.type} request for ${changedRequest.item} (${changedRequest.patientName}) marked ${status}.`,
      });
    }
    showToast(`Status updated to ${status}`);
  };

  const updatePurchaseStatus = (order: AdminRequest, purchaseStatus: PurchaseOrderStatus) => {
    const currentStatus = order.purchaseStatus || 'Pending Approval';
    const nextStatuses: Record<PurchaseOrderStatus, PurchaseOrderStatus | null> = {
      Draft: 'Pending Approval',
      'Pending Approval': 'Ordered',
      Ordered: 'Received',
      Received: null,
    };
    if (nextStatuses[currentStatus] !== purchaseStatus) {
      showToast(`Purchase orders must move from ${currentStatus} to ${nextStatuses[currentStatus] || 'no further status'}.`, 'danger');
      return;
    }
    if (purchaseStatus === 'Received') {
      try {
        const quantity = Number.parseInt(order.quantity, 10);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          showToast('Cannot receive order: quantity is invalid.', 'danger');
          return;
        }
        receivePurchaseOrderStock({
          id: order.id,
          type: order.type === 'Medicine' ? 'medicine' : order.type === 'Blood' ? 'blood' : 'supplies',
          item: order.item,
          quantity,
          vendor: order.hospital,
          batchNumber: order.batchNumber || '',
          expiryDate: order.expiryDate || '',
          receivedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Could not receive purchase order.', error);
        showToast('Could not receive order; inventory was not updated.', 'danger');
        return;
      }
    }
    const updatedRequests = requests.map(request => request.id === order.id
      ? { ...request, purchaseStatus, status: purchaseStatus === 'Received' ? 'Completed' as RequestStatus : request.status }
      : request);
    setRequests(updatedRequests);
    saveAdminRequests(updatedRequests);
    recordAdminActivity({
      category: 'order',
      tone: purchaseStatus === 'Received' ? 'success' : 'info',
      message: `Purchase order ${order.id} for ${order.item} moved to ${purchaseStatus}${purchaseStatus === 'Received' ? `; ${order.quantity} added to inventory.` : '.'}`,
    });
    showToast(`Purchase order marked ${purchaseStatus}`);
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = requests.map(r => ({ 'Type': r.type, 'Stock Availability': r.availability || 'Not provided', 'Patient Name': r.patientName, 'Item': r.item, 'Quantity': r.quantity, 'Hospital': r.hospital, 'Priority': r.priority, 'Status': r.status, 'Date': r.date, 'Contact': r.contact }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 18 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Requests');
      XLSX.writeFile(wb, `MediConnect_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Exported to Excel');
    } catch { showToast('Export failed', 'danger'); }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    emergency: requests.filter(r => r.priority === 'Emergency').length,
    completed: requests.filter(r => r.status === 'Completed').length,
  };

  return (
    <div className="space-y-6 fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium fade-in ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}{toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{stats.total} total · {stats.pending} pending · {stats.emergency} emergency</p>
        </div>
        <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
          <Download size={16} className="text-success" />Export Excel
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, color: 'text-primary' },
          { label: 'Pending', value: stats.pending, color: 'text-warning' },
          { label: 'Emergency', value: stats.emergency, color: 'text-danger' },
          { label: 'Completed', value: stats.completed, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="card-base p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card-base p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search patient, item, hospital..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
          {(['All', 'Medicine', 'Blood', 'Supplies'] as const).map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${typeFilter === f ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'}`}>{f}</button>
          ))}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'All' | RequestStatus)} className="select-field text-sm w-36">
          <option value="All">All Status</option>
          {(Object.keys(statusConfig) as RequestStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as 'All' | RequestPriority)} className="select-field text-sm w-36">
          <option value="All">All Priority</option>
          {(['Normal', 'Urgent', 'Emergency'] as RequestPriority[]).map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Stock</th>
                <th className="table-header-cell">Patient</th>
                <th className="table-header-cell">Item</th>
                <th className="table-header-cell">Qty</th>
                <th className="table-header-cell">Hospital</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="table-cell text-center text-muted-foreground py-12">No requests match the selected filters</td></tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="table-row-hover group">
                  <td className="table-cell">
                    <span className={`badge-base text-xs ${req.type === 'Blood' ? 'bg-danger/10 text-danger border border-danger/20' : req.type === 'Supplies' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-secondary text-primary border border-primary/20'}`}>{req.type}</span>
                  </td>
                  <td className="table-cell">
                    {req.availability ? (
                      <span className={`badge-base text-xs ${req.availability === 'Out of Stock' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
                        {req.availability}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="table-cell font-medium whitespace-nowrap">{req.patientName}</td>
                  <td className="table-cell text-muted-foreground whitespace-nowrap">{req.item}</td>
                  <td className="table-cell tabular-nums whitespace-nowrap">{req.quantity}</td>
                  <td className="table-cell text-muted-foreground whitespace-nowrap max-w-[120px] truncate">{req.hospital}</td>
                  <td className="table-cell"><span className={`badge-base ${priorityConfig[req.priority]}`}>{req.priority}</span></td>
                  <td className="table-cell">
                    {req.source === 'staff-purchase' ? (
                      <select
                        value={req.purchaseStatus || 'Pending Approval'}
                        onChange={e => updatePurchaseStatus(req, e.target.value as PurchaseOrderStatus)}
                        disabled={req.purchaseStatus === 'Received'}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer appearance-none ${req.purchaseStatus === 'Received' ? statusConfig.Completed.className : req.purchaseStatus === 'Ordered' ? statusConfig.Processing.className : statusConfig.Pending.className} bg-transparent`}
                      >
                        {(['Draft', 'Pending Approval', 'Ordered', 'Received'] as PurchaseOrderStatus[]).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    ) : (
                    <select value={req.status} onChange={e => updateStatus(req.id, e.target.value as RequestStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer appearance-none ${statusConfig[req.status].className} bg-transparent`}>
                      {(Object.keys(statusConfig) as RequestStatus[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                    )}
                  </td>
                  <td className="table-cell text-muted-foreground whitespace-nowrap">{req.date}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {req.source === 'staff-purchase' && <PurchaseOrderActions order={req} />}
                      <button onClick={() => setViewModal(req)} className="btn-icon text-muted-foreground hover:text-primary" title="View"><Eye size={15} /></button>
                      {req.status === 'Pending' && (
                        <>
                          <button onClick={() => updateStatus(req.id, 'Processing')} className="btn-icon text-muted-foreground hover:text-success" title="Accept"><Check size={15} /></button>
                          <button onClick={() => updateStatus(req.id, 'Rejected')} className="btn-icon text-muted-foreground hover:text-danger" title="Reject"><X size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {requests.length} requests</p>
        </div>
      </div>

      {viewModal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4" onClick={() => setViewModal(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Request Details</h2>
              <button onClick={() => setViewModal(null)} className="btn-icon text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Request ID', value: viewModal.id },
                { label: 'Type', value: viewModal.type },
                { label: 'Stock Availability', value: viewModal.availability || 'Not provided' },
                { label: 'Patient Name', value: viewModal.patientName },
                { label: 'Item', value: viewModal.item },
                { label: 'Quantity', value: viewModal.quantity },
                { label: 'Hospital', value: viewModal.hospital },
                { label: 'Contact', value: viewModal.contact },
                { label: 'Priority', value: viewModal.priority },
                { label: 'Status', value: viewModal.status },
                { label: 'Date', value: viewModal.date },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
