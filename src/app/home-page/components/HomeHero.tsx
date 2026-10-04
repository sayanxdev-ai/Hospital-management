'use client';
import React from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ShieldCheck, Clock, Heart } from 'lucide-react';
import { isSignedIn } from '@/lib/auth';

const trustBadges = [
  { icon: ShieldCheck, label: 'Verified Inventory' },
  { icon: Clock, label: 'Real-time Updates' },
  { icon: Heart, label: '24/7 Support' },
];

export default function HomeHero() {
  return (
    <section className="relative gradient-hero min-h-[88vh] flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00b4a6 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />
        {/* Medical cross pattern */}
        <svg className="absolute top-1/2 right-1/4 -translate-y-1/2 opacity-5 w-64 h-64" viewBox="0 0 100 100">
          <rect x="40" y="10" width="20" height="80" fill="white" rx="4" />
          <rect x="10" y="40" width="80" height="20" fill="white" rx="4" />
        </svg>
      </div>
      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-subtle" />
              Live Medical Resource Platform
            </div>

            <h1 className="text-hero-xl font-extrabold text-white mb-6 leading-tight">
              Find Essential<br />
              <span className="text-accent">Medical Resources</span><br />
              Instantly
            </h1>

            <p className="text-white/80 text-lg mb-8 max-w-lg leading-relaxed">
              Search medicine availability, locate blood donors, check medical supplies — all from one unified platform designed for hospitals, clinics, and patients.
            </p>

            {/* Quick search bar */}
            <div className="flex gap-3 mb-8 max-w-lg">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search medicine, blood group..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-0 bg-white text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-card-md"
                  readOnly
                />
              </div>
              <Link
                href="/#medicines"
                onClick={(event) => {
                  if (!isSignedIn()) {
                    event.preventDefault();
                    window.location.href = '/sign-up-login-screen';
                  }
                }}
                className="btn-primary px-5 py-3.5 rounded-xl"
              >
                Search
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {trustBadges?.map((badge) => (
                <div key={`trust-${badge?.label}`} className="flex items-center gap-2 text-white/80 text-sm">
                  <badge.icon size={16} className="text-accent" />
                  <span>{badge?.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating stat cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end">
            {/* Main stat card */}
            <div className="glass-card rounded-2xl p-6 w-72 shadow-card-lg slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Heart size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Blood Units Available</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">1,248</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['A+', 'B+', 'O+', 'AB+']?.map((bg) => (
                  <div key={`hero-bg-${bg}`} className="text-center p-2 rounded-lg bg-danger/10">
                    <p className="text-xs font-bold text-danger">{bg}</p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {bg === 'A+' ? '312' : bg === 'B+' ? '284' : bg === 'O+' ? '398' : '254'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medicine availability card */}
            <div className="glass-card rounded-2xl p-5 w-64 shadow-card-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">Medicine Stock</p>
                <span className="badge-base status-available">Live</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Paracetamol 500mg', status: 'available' },
                  { name: 'Azithromycin 500mg', status: 'low' },
                  { name: 'Insulin Glargine', status: 'available' },
                ]?.map((med) => (
                  <div key={`hero-med-${med?.name}`} className="flex items-center justify-between">
                    <span className="text-xs text-foreground truncate max-w-[140px]">{med?.name}</span>
                    <span className={`badge-base ${med?.status === 'available' ? 'status-available' : 'status-low'}`}>
                      {med?.status === 'available' ? '🟢' : '🟡'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Patients card */}
            <div className="glass-card rounded-2xl p-5 w-56 shadow-card-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Patients Today</p>
              <p className="text-3xl font-bold text-foreground tabular-nums mb-1">284</p>
              <div className="flex items-center gap-1 text-xs text-success font-medium">
                <ArrowRight size={12} className="rotate-[-45deg]" />
                <span>+12 since 8 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="var(--background)" />
        </svg>
      </div>
    </section>
  );
}