'use client';
import React from 'react';
import Link from 'next/link';
import { Pill, Droplets, Package, UserCheck, ArrowRight } from 'lucide-react';
import { isSignedIn } from '@/lib/auth';

const features = [
  {
    id: 'medicine',
    icon: Pill,
    color: 'text-primary',
    bgColor: 'bg-secondary',
    borderColor: 'border-primary/20',
    title: 'Medicine Search',
    description: 'Search from 248+ medicines across categories. Check availability, pricing, and prescription requirements instantly.',
    stats: '248 medicines',
    statColor: 'text-primary',
    cta: 'Search Medicine',
    href: '/#medicines',
    badge: 'Most Used',
    badgeColor: 'bg-secondary text-primary',
  },
  {
    id: 'blood',
    icon: Droplets,
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/20',
    title: 'Blood Bank',
    description: 'Find available blood groups across multiple blood banks. Submit emergency requests with priority handling.',
    stats: '8 blood groups',
    statColor: 'text-danger',
    cta: 'Find Blood',
    href: '/#blood-bank',
    badge: 'Critical',
    badgeColor: 'bg-danger/10 text-danger',
  },
  {
    id: 'supplies',
    icon: Package,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    title: 'Medical Supplies',
    description: 'Check availability of surgical gloves, syringes, PPE kits, and 300+ essential medical supply items.',
    stats: '312 supply items',
    statColor: 'text-accent',
    cta: 'View Supplies',
    href: '/#supplies',
    badge: 'Updated Daily',
    badgeColor: 'bg-accent/10 text-accent',
  },
  {
    id: 'patient',
    icon: UserCheck,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    title: 'Patient Status',
    description: 'Authorized staff can view, update, and manage patient records, admission status, and discharge information.',
    stats: 'Staff only',
    statColor: 'text-warning',
    cta: 'Staff Login',
    href: '/sign-up-login-screen',
    badge: 'Restricted',
    badgeColor: 'bg-warning/10 text-warning',
  },
];

export default function FeatureCards() {
  return (
    <section id="medicines" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">What Can You Do?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            MediConnect brings together medical resources, blood bank data, and patient management in one accessible platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {features?.map((feature) => (
            <div
              key={`feature-${feature?.id}`}
              className={`card-base card-hover p-6 border-2 ${feature?.borderColor} flex flex-col`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl ${feature?.bgColor} flex items-center justify-center`}>
                  <feature.icon size={24} className={feature?.color} />
                </div>
                <span className={`badge-base text-xs font-semibold px-2.5 py-1 rounded-full ${feature?.badgeColor}`}>
                  {feature?.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{feature?.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{feature?.description}</p>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${feature?.statColor}`}>{feature?.stats}</span>
                <Link
                  href={feature?.href}
                  onClick={(event) => {
                    const protectedRoutes = ['/sign-up-login-screen', '/#medicines', '/#blood-bank', '/#supplies'];
                    const isProtectedFeature = feature?.id === 'patient' || feature?.id === 'medicine' || feature?.id === 'blood' || feature?.id === 'supplies';

                    if (isProtectedFeature && !isSignedIn()) {
                      if (!isSignedIn()) {
                        event.preventDefault();
                        window.location.href = '/sign-up-login-screen';
                        return;
                      }
                    }

                    if (feature?.href && protectedRoutes.includes(feature.href) && !isSignedIn()) {
                      event.preventDefault();
                      window.location.href = '/sign-up-login-screen';
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${feature?.color} hover:gap-2.5 transition-all duration-150`}
                >
                  {feature?.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}