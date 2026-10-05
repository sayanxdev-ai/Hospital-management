import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ClipboardCheck, Download, Droplets, Package, Pill, Stethoscope, UserRound, X } from 'lucide-react';
import { ADMIN_ACTIVITY_CHANGED, deleteAdminActivity, formatActivityTime, getAdminActivities, type ActivityCategory, type ActivityTone, type AdminActivity } from '../lib/activityStorage';

const activityIcons: Record<ActivityCategory, typeof Activity> = {
  order: Package,
  patient: UserRound,
  doctor: Stethoscope,
  medicine: Pill,
  supply: Package,
  blood: Droplets,
  request: ClipboardCheck,
};

const toneStyles: Record<ActivityTone, { color: string; bg: string }> = {
  danger: { color: 'text-danger', bg: 'bg-danger/10' },
  warning: { color: 'text-warning', bg: 'bg-warning/10' },
  success: { color: 'text-success', bg: 'bg-success/10' },
  info: { color: 'text-info', bg: 'bg-info/10' },
};

export default function ActivityFeed({ showAll = false }: { showAll?: boolean }) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    const refreshActivities = () => setActivities(getAdminActivities());
    refreshActivities();
    window.addEventListener(ADMIN_ACTIVITY_CHANGED, refreshActivities);
    window.addEventListener('storage', refreshActivities);
    return () => {
      window.removeEventListener(ADMIN_ACTIVITY_CHANGED, refreshActivities);
      window.removeEventListener('storage', refreshActivities);
    };
  }, []);

  const visibleActivities = showAll ? activities : activities.slice(0, 6);

  const exportActivities = async () => {
    setExportError('');
    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(activities.map(activity => ({
        Timestamp: formatActivityTime(activity.createdAt),
        User: activity.actor || 'Legacy activity',
        Category: activity.category,
        Severity: activity.tone,
        Activity: activity.message,
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Log');
      XLSX.writeFile(workbook, `MediConnect_Audit_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Could not export audit report.', error);
      setExportError('Audit report could not be exported. Please try again.');
    }
  };

  return (
    <div className={`card-base p-5 ${showAll ? '' : 'h-full'} flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header">{showAll ? 'All Activity & Notifications' : 'Activity Feed'}</h3>
        {showAll ? (
          <button type="button" onClick={exportActivities} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted">
            <Download size={14} />Export Audit Log
          </button>
        ) : <Link href="/admin-dashboard/activity" className="text-xs text-primary font-medium hover:underline">See all</Link>}
      </div>
      {exportError && <p role="alert" className="mb-3 text-sm text-danger">{exportError}</p>}
      <div className={showAll ? '' : 'flex-1 overflow-y-auto scrollbar-thin'}>
        <div className="relative">
          {visibleActivities.length > 0 ? (
            <>
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {visibleActivities.map(activity => {
                  const Icon = activityIcons[activity.category];
                  const tone = toneStyles[activity.tone];
                  return (
                    <div key={activity.id} className="flex items-start gap-3 relative">
                      <div className={`w-10 h-10 rounded-full ${tone.bg} flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-background`}>
                        <Icon size={16} className={tone.color} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <p className="text-sm text-foreground leading-snug">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatActivityTime(activity.createdAt)} · {activity.actor || 'Legacy activity'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteAdminActivity(activity.id)}
                        className="btn-icon h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-danger"
                        aria-label={`Delete activity: ${activity.message}`}
                        title="Delete activity"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No activity has been recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}