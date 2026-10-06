import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { EMERGENCY_CONTACT_NUMBER } from '@/lib/emergency';

export default function PublicFooter() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <AppLogo size={32} />
              <span className="font-bold text-xl">MediConnect</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              A unified medical resource management platform connecting patients, staff, and administrators for better healthcare delivery.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Platform</h5>
            <ul className="space-y-2">
              {[['Medicine Search', '/#medicines'], ['Blood Bank', '/#blood-bank'], ['Medical Supplies', '/#supplies'], ['Staff Portal', '/sign-up-login-screen']]?.map(([label, href]) => (
                <li key={`footer-${label}`}>
                  <Link href={href} className="text-white/60 text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Emergency</h5>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Emergency: <a href={`tel:${EMERGENCY_CONTACT_NUMBER}`} className="text-white font-medium hover:underline">{EMERGENCY_CONTACT_NUMBER}</a></li>
              <li>Blood Bank: <span className="text-white font-medium">1800-180-1104</span></li>
              <li>Support: <span className="text-white font-medium">1800-112-333</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© 2026 MediConnect. All rights reserved. For educational and demonstration purposes.</p>
          <p className="text-white/40 text-xs">Built with Next.js · Tailwind CSS · MySQL</p>
        </div>
      </div>
    </footer>
  );
}
