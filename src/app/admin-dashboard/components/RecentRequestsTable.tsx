'use client';
import React, { useState } from 'react';
import { Eye, Check, X, ChevronUp, ChevronDown } from 'lucide-react';

type RequestStatus = 'Pending' | 'Processing' | 'Available' | 'Completed' | 'Cancelled' | 'Rejected';
type RequestPriority = 'Normal' | 'Urgent' | 'Emergency';
type RequestType = 'Medicine' | 'Blood';

interface Request {
  id: string;
  type: RequestType;
  patientName: string;
  item: string;
  quantity: string;
  hospital: string;
  priority: RequestPriority;
  status: RequestStatus;
  date: string;
  contact: string;
}

const requests: Request[] = [
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
];

const statusConfig: Record<RequestStatus, { className: string; label: string }> = {
  Pending: { className: 'bg-warning/10 text-warning border border-warning/20', label: 'Pending' },
  Processing: { className: 'bg-info/10 text-info border border-info/20', label: 'Processing' },
  Available: { className: 'bg-success/10 text-success border border-success/20', label: 'Available' },
  Completed: { className: 'bg-success/10 text-success border border-success/20', label: 'Completed' },
  Cancelled: { className: 'bg-muted text-muted-foreground border border-border', label: 'Cancelled' },
  Rejected: { className: 'bg-danger/10 text-danger border border-danger/20', label: 'Rejected' },
};

const priorityConfig: Record<RequestPriority, { className: string }> = {
  Normal: { className: 'priority-normal' },
  Urgent: { className: 'priority-urgent' },
  Emergency: { className: 'priority-emergency' },
};

export default function RecentRequestsTable() {
  const [filter, setFilter] = useState<'All' | RequestType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus>('All');
  const [statuses, setStatuses] = useState<Record<string, RequestStatus>>(
    Object.fromEntries(requests.map(r => [r.id, r.status]))
  );

  const filtered = requests.filter(r => {
    const matchType = filter === 'All' || r.type === filter;
    const matchStatus = statusFilter === 'All' || statuses[r.id] === statusFilter;
    return matchType && matchStatus;
  });

  const updateStatus = (id: string, newStatus: RequestStatus) => {
    setStatuses(prev => ({ ...prev, [id]: newStatus }));
  };

  return (
    <div className="card-base overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
        <h3 className="section-header">Recent Requests</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
            {(['All', 'Medicine', 'Blood'] as const).map((f) => (
              <button
                key={`type-filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filter === f ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | RequestStatus)}
            className="select-field text-xs py-1.5 w-32"
          >
            <option value="All">All Status</option>
            {Object.keys(statusConfig).map(s => (
              <option key={`status-opt-${s}`} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="table-header-cell">Type</th>
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
              <tr>
                <td colSpan={9} className="table-cell text-center text-muted-foreground py-10">
                  No requests match the selected filters
                </td>
              </tr>
            ) : (
              filtered.map((req) => {
                const currentStatus = statuses[req.id];
                const sCfg = statusConfig[currentStatus];
                const pCfg = priorityConfig[req.priority];
                return (
                  <tr key={req.id} className="table-row-hover group">
                    <td className="table-cell">
                      <span className={`badge-base text-xs ${
                        req.type === 'Blood' ?'bg-danger/10 text-danger border border-danger/20' :'bg-secondary text-primary border border-primary/20'
                      }`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="table-cell font-medium whitespace-nowrap">{req.patientName}</td>
                    <td className="table-cell text-muted-foreground whitespace-nowrap">{req.item}</td>
                    <td className="table-cell tabular-nums whitespace-nowrap">{req.quantity}</td>
                    <td className="table-cell text-muted-foreground whitespace-nowrap max-w-[120px] truncate">{req.hospital}</td>
                    <td className="table-cell">
                      <span className={`badge-base ${pCfg.className}`}>{req.priority}</span>
                    </td>
                    <td className="table-cell">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateStatus(req.id, e.target.value as RequestStatus)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer appearance-none ${sCfg.className} bg-transparent`}
                      >
                        {Object.keys(statusConfig).map(s => (
                          <option key={`status-sel-${req.id}-${s}`} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell text-muted-foreground whitespace-nowrap">{req.date}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="btn-icon text-muted-foreground hover:text-primary"
                          title="View request details"
                        >
                          <Eye size={15} />
                        </button>
                        {currentStatus === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, 'Processing')}
                              className="btn-icon text-muted-foreground hover:text-success"
                              title="Accept request"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => updateStatus(req.id, 'Rejected')}
                              className="btn-icon text-muted-foreground hover:text-danger"
                              title="Reject request"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {requests.length} requests
        </p>
        <div className="flex items-center gap-1">
          <button className="btn-icon text-muted-foreground" disabled>
            <ChevronUp size={14} className="-rotate-90" />
          </button>
          <span className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold">1</span>
          <button className="btn-icon text-muted-foreground">
            <ChevronDown size={14} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}