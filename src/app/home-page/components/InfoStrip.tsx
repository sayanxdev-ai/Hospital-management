import React from 'react';
import { Phone, Clock, AlertCircle, HeartPulse } from 'lucide-react';

const contacts = [
  { icon: Phone, label: 'Emergency', value: '108', color: 'text-danger', bg: 'bg-danger/10' },
  { icon: HeartPulse, label: 'Blood Bank Helpline', value: '1800-180-1104', color: 'text-danger', bg: 'bg-danger/10' },
  { icon: Phone, label: 'MediConnect Support', value: '1800-112-333', color: 'text-primary', bg: 'bg-secondary' },
  { icon: Clock, label: 'Support Hours', value: '24 × 7', color: 'text-accent', bg: 'bg-accent/10' },
];

export default function InfoStrip() {
  return (
    <section className="py-16 bg-card border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Emergency banner */}
        <div className="rounded-2xl gradient-hero p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Medical Emergency?</h3>
              <p className="text-white/80 text-sm">Call 108 immediately or use our emergency blood request form</p>
            </div>
          </div>
          <a
            href="tel:108"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors active:scale-95"
          >
            <Phone size={16} />
            Call 108 Now
          </a>
        </div>

        {/* Contact grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contacts?.map((c) => (
            <div key={`contact-${c?.label}`} className="card-base p-5 text-center card-hover">
              <div className={`w-10 h-10 rounded-xl ${c?.bg} flex items-center justify-center mx-auto mb-3`}>
                <c.icon size={20} className={c?.color} />
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{c?.label}</p>
              <p className={`text-lg font-bold tabular-nums ${c?.color}`}>{c?.value}</p>
            </div>
          ))}
        </div>

        {/* Features strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'For Patients & Public', items: ['Search medicine availability', 'Find blood donors', 'Submit blood requests', 'Track request status'] },
            { title: 'For Medical Staff', items: ['Manage patient records', 'Update inventory levels', 'Process blood requests', 'Discharge & transfer patients'] },
            { title: 'For Administrators', items: ['Full CRUD on all records', 'Dashboard with live stats', 'Role & user management', 'Charts and reports'] },
          ]?.map((col) => (
            <div key={`info-${col?.title}`} className="card-base p-6">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full gradient-primary" />
                {col?.title}
              </h4>
              <ul className="space-y-2">
                {col?.items?.map((item) => (
                  <li key={`info-item-${col?.title}-${item}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}