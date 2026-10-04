export type ActivityCategory = 'order' | 'patient' | 'doctor' | 'medicine' | 'supply' | 'blood' | 'request';
export type ActivityTone = 'danger' | 'warning' | 'success' | 'info';

export interface AdminActivity {
  id: string;
  message: string;
  createdAt: string;
  category: ActivityCategory;
  tone: ActivityTone;
}

const ACTIVITY_STORAGE_KEY = 'mediconnect-admin-activity';
export const ADMIN_ACTIVITY_CHANGED = 'mediconnect-admin-activity-changed';
const activityCategories: ActivityCategory[] = ['order', 'patient', 'doctor', 'medicine', 'supply', 'blood', 'request'];
const activityTones: ActivityTone[] = ['danger', 'warning', 'success', 'info'];

export function getAdminActivities(): AdminActivity[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!stored) return [];

    const activities: unknown = JSON.parse(stored);
    if (!Array.isArray(activities)) return [];
    return activities.filter((activity): activity is AdminActivity =>
      typeof activity === 'object' && activity !== null &&
      'id' in activity && typeof activity.id === 'string' &&
      'message' in activity && typeof activity.message === 'string' &&
      'createdAt' in activity && typeof activity.createdAt === 'string' &&
      !Number.isNaN(Date.parse(activity.createdAt)) &&
      'category' in activity && typeof activity.category === 'string' &&
      activityCategories.some(category => category === activity.category) &&
      'tone' in activity && typeof activity.tone === 'string' &&
      activityTones.some(tone => tone === activity.tone)
    ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch (error) {
    console.error('Could not load activity history.', error);
    return [];
  }
}

export function recordAdminActivity(
  activity: Omit<AdminActivity, 'id' | 'createdAt'>,
): void {
  if (typeof window === 'undefined') return;

  const entry: AdminActivity = {
    ...activity,
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const activities = getAdminActivities();
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify([entry, ...activities]));
    window.dispatchEvent(new Event(ADMIN_ACTIVITY_CHANGED));
  } catch (error) {
    console.error('Could not save activity history.', error);
  }
}

export function deleteAdminActivity(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const activities = getAdminActivities().filter(activity => activity.id !== id);
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
    window.dispatchEvent(new Event(ADMIN_ACTIVITY_CHANGED));
  } catch (error) {
    console.error('Could not delete activity history item.', error);
  }
}

export function formatActivityTime(createdAt: string): string {
  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) return 'Unknown time';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}
