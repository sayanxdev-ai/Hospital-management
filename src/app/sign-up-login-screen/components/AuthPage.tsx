'use client';
import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';
import { ShieldCheck, Users, UserCog, Stethoscope } from 'lucide-react';

const features = [
  { icon: ShieldCheck, text: 'Role-based secure access' },
  { icon: Users, text: 'Patient record management' },
  { icon: UserCog, text: 'Inventory control for staff' },
  { icon: Stethoscope, text: 'Real-time medical data' },
];

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00b4a6 0%, transparent 70%)' }} />
        <div className="absolute bottom-32 left-0 w-60 h-60 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <AppLogo size={40} />
          <span className="font-bold text-2xl text-white">MediConnect</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Medical Resources,<br />
            <span className="text-accent">One Platform.</span>
          </h1>
          <p className="text-white/75 text-lg mb-10 max-w-md leading-relaxed">
            Access medicines, blood bank data, patient records, and inventory management — all with role-based security.
          </p>
          <div className="space-y-4">
            {features?.map((f) => (
              <div key={`auth-feat-${f?.text}`} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <f.icon size={16} className="text-white" />
                </div>
                <span className="text-white/85 text-sm font-medium">{f?.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/50 text-xs">Secure · HIPAA-aligned · Role-protected</p>
        </div>
      </div>
      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <AppLogo size={32} />
            <span className="font-bold text-xl text-foreground">MediConnect</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {tab === 'login' ? 'Sign in to access your dashboard' : 'Register for patient or staff access'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === 'login' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === 'register' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm onSwitchToRegister={() => setTab('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setTab('login')} />
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo accounts are available for sign-in, and custom registrations are kept in the local app session.
          </p>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← Back to MediConnect Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}