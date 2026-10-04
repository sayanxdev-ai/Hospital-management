'use client';
import React, { useState } from 'react';
import { User, Bell, Shield, Database, Palette, Globe, Save, Check, Eye, EyeOff, Building2, Phone, Mail, MapPin } from 'lucide-react';

type SettingsTab = 'profile' | 'hospital' | 'notifications' | 'security' | 'appearance' | 'system';

const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'hospital', label: 'Hospital Info', icon: Building2 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'system', label: 'System', icon: Database },
];

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [toast, setToast] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: 'Sayan Karmakar', email: 'arjun.kapoor@mediconnect.in',
    phone: '+91 98765 43210', role: 'Administrator', department: 'Administration',
    bio: 'Senior administrator managing MediConnect hospital information system.',
  });

  // Hospital state
  const [hospital, setHospital] = useState({
    name: 'MediConnect General Hospital', address: '12, Healthcare Avenue, Bandra West',
    city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
    phone: '+91 22 1234 5678', email: 'info@mediconnect.in',
    website: 'www.mediconnect.in', beds: '500', established: '1998',
    registration: 'MH-HOS-2024-001',
  });

  // Notification state
  const [notifs, setNotifs] = useState({
    emailAlerts: true, smsAlerts: false, pushNotifs: true,
    lowStockAlert: true, bloodRequestAlert: true, patientAdmission: true,
    patientDischarge: true, emergencyAlert: true, dailyReport: false,
    weeklyReport: true,
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
    twoFactor: false, sessionTimeout: '30', loginAlerts: true,
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: 'light', language: 'en', dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h', timezone: 'Asia/Kolkata', compactMode: false,
  });

  // System state
  const [system, setSystem] = useState({
    autoBackup: true, backupFrequency: 'daily', dataRetention: '365',
    maintenanceMode: false, debugMode: false, analyticsEnabled: true,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    showToast('Settings saved successfully');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      showToast('Passwords do not match');
      return;
    }
    if (security.newPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }
    setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    showToast('Password changed successfully');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-success text-white text-sm font-medium fade-in">
          <Check size={16} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account, hospital information, and system preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="card-base p-2 space-y-0.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  activeTab === tab.key ? 'nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card-base p-6 space-y-6">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Profile Settings</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  AK
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.role}</p>
                  <button className="mt-2 text-xs text-primary font-medium hover:underline">Change Avatar</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Mail size={12} /> Email Address</label>
                  <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Phone size={12} /> Phone Number</label>
                  <input type="text" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Department</label>
                  <input type="text" value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                  <Save size={15} /> Save Profile
                </button>
              </div>
            </div>
          )}

          {/* Hospital Info Tab */}
          {activeTab === 'hospital' && (
            <div className="card-base p-6 space-y-6">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Hospital Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Building2 size={12} /> Hospital Name</label>
                  <input type="text" value={hospital.name} onChange={e => setHospital(h => ({ ...h, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><MapPin size={12} /> Address</label>
                  <input type="text" value={hospital.address} onChange={e => setHospital(h => ({ ...h, address: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">City</label>
                  <input type="text" value={hospital.city} onChange={e => setHospital(h => ({ ...h, city: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">State</label>
                  <input type="text" value={hospital.state} onChange={e => setHospital(h => ({ ...h, state: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Phone size={12} /> Phone</label>
                  <input type="text" value={hospital.phone} onChange={e => setHospital(h => ({ ...h, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Mail size={12} /> Email</label>
                  <input type="email" value={hospital.email} onChange={e => setHospital(h => ({ ...h, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Total Beds</label>
                  <input type="number" value={hospital.beds} onChange={e => setHospital(h => ({ ...h, beds: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Registration No.</label>
                  <input type="text" value={hospital.registration} onChange={e => setHospital(h => ({ ...h, registration: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                  <Save size={15} /> Save Hospital Info
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card-base p-6 space-y-6">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive alerts via email' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive alerts via SMS' },
                  { key: 'pushNotifs', label: 'Push Notifications', desc: 'Browser push notifications' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifs[item.key as keyof typeof notifs] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifs[item.key as keyof typeof notifs] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide pt-2">Alert Types</h3>
                {[
                  { key: 'lowStockAlert', label: 'Low Stock Alerts', desc: 'When medicine/supply stock is low' },
                  { key: 'bloodRequestAlert', label: 'Blood Request Alerts', desc: 'New blood requests submitted' },
                  { key: 'patientAdmission', label: 'Patient Admission', desc: 'When a new patient is admitted' },
                  { key: 'patientDischarge', label: 'Patient Discharge', desc: 'When a patient is discharged' },
                  { key: 'emergencyAlert', label: 'Emergency Alerts', desc: 'Critical emergency notifications' },
                  { key: 'dailyReport', label: 'Daily Report', desc: 'Daily summary report at 8 AM' },
                  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly analytics every Monday' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifs[item.key as keyof typeof notifs] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifs[item.key as keyof typeof notifs] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                  <Save size={15} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="card-base p-6 space-y-5">
                <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={security.currentPassword}
                        onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))} required
                        className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showNewPassword ? 'text' : 'password'} value={security.newPassword}
                        onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))} required minLength={8}
                        className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm New Password</label>
                    <input type="password" value={security.confirmPassword}
                      onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))} required
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <button type="submit" className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                    <Shield size={15} /> Update Password
                  </button>
                </form>
              </div>
              <div className="card-base p-6 space-y-4">
                <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Security Options</h2>
                {[
                  { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account' },
                  { key: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified of new login attempts' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setSecurity(s => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${security[item.key as keyof typeof security] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${security[item.key as keyof typeof security] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Session Timeout</p>
                    <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
                  </div>
                  <select value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: e.target.value }))}
                    className="select-field text-sm w-32">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="0">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="card-base p-6 space-y-6">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Appearance & Locale</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Theme</label>
                  <select value={appearance.theme} onChange={e => setAppearance(a => ({ ...a, theme: e.target.value }))} className="select-field text-sm w-full">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Globe size={12} /> Language</label>
                  <select value={appearance.language} onChange={e => setAppearance(a => ({ ...a, language: e.target.value }))} className="select-field text-sm w-full">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="gu">Gujarati</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date Format</label>
                  <select value={appearance.dateFormat} onChange={e => setAppearance(a => ({ ...a, dateFormat: e.target.value }))} className="select-field text-sm w-full">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Time Format</label>
                  <select value={appearance.timeFormat} onChange={e => setAppearance(a => ({ ...a, timeFormat: e.target.value }))} className="select-field text-sm w-full">
                    <option value="12h">12-hour (AM/PM)</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Timezone</label>
                  <select value={appearance.timezone} onChange={e => setAppearance(a => ({ ...a, timezone: e.target.value }))} className="select-field text-sm w-full">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Reduce spacing in tables</p>
                  </div>
                  <button
                    onClick={() => setAppearance(a => ({ ...a, compactMode: !a.compactMode }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${appearance.compactMode ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${appearance.compactMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                  <Save size={15} /> Save Appearance
                </button>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="card-base p-6 space-y-6">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">System Configuration</h2>
              <div className="space-y-4">
                {[
                  { key: 'autoBackup', label: 'Automatic Backup', desc: 'Automatically backup database' },
                  { key: 'analyticsEnabled', label: 'Analytics', desc: 'Enable usage analytics' },
                  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Restrict access for maintenance' },
                  { key: 'debugMode', label: 'Debug Mode', desc: 'Enable detailed error logging' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setSystem(s => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${system[item.key as keyof typeof system] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${system[item.key as keyof typeof system] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Backup Frequency</p>
                    <p className="text-xs text-muted-foreground">How often to backup data</p>
                  </div>
                  <select value={system.backupFrequency} onChange={e => setSystem(s => ({ ...s, backupFrequency: e.target.value }))} className="select-field text-sm w-32">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Data Retention</p>
                    <p className="text-xs text-muted-foreground">Keep records for (days)</p>
                  </div>
                  <select value={system.dataRetention} onChange={e => setSystem(s => ({ ...s, dataRetention: e.target.value }))} className="select-field text-sm w-32">
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="730">2 years</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg border border-danger text-danger text-sm font-medium hover:bg-danger/10 transition-colors">
                  Clear Cache
                </button>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2 text-sm">
                  <Save size={15} /> Save System Settings
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
