'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, LogIn, Copy, Check } from 'lucide-react';
import { setStoredSession } from '@/lib/auth';


type LoginFormData = {
  email: string;
  password: string;
  remember: boolean;
};

type DemoCredential = {
  role: string;
  email: string;
  password: string;
  badge: string;
  badgeColor: string;
};

const demoCredentials: DemoCredential[] = [
  { role: 'Admin', email: 'admin@mediconnect.in', password: 'Admin@2026', badge: 'Full Access', badgeColor: 'bg-primary/10 text-primary' },
  { role: 'Staff', email: 'staff@mediconnect.in', password: 'Staff@2026', badge: 'Clinical', badgeColor: 'bg-accent/10 text-accent' },
  { role: 'User', email: 'user@mediconnect.in', password: 'User@2026', badge: 'Patient', badgeColor: 'bg-warning/10 text-warning' },
];

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { remember: false }
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const autofill = (cred: DemoCredential) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
    setError('');
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim(), password: data.password }),
      });
      const result = await response.json() as {
        account?: { email: string; role: string; name: string };
        error?: string;
      };

      if (!response.ok || !result.account) {
        throw new Error(result.error || 'Could not verify login details.');
      }

      const { email, role, name } = result.account;
      setStoredSession({ email, role, name });
      setSuccess(`Signed in as ${role}. Redirecting...`);
      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 800);
    } catch (loginError) {
      console.error('Could not verify login in local auth store.', loginError);
      setError(loginError instanceof Error ? loginError.message : 'Could not verify login details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Error / Success */}
        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success font-medium">
            {success}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="label-text" htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className={`input-field ${errors.email ? 'border-danger ring-1 ring-danger' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
            })}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-text mb-0" htmlFor="login-password">Password</label>
            <button type="button" className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`input-field pr-10 ${errors.password ? 'border-danger ring-1 ring-danger' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
            {...register('remember')}
          />
          <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">Remember me for 30 days</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3"
          style={{ minWidth: '200px' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={16} />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">Demo Accounts</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="card-base overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Click a row to autofill credentials</p>
          </div>
          <div className="divide-y divide-border">
            {demoCredentials.map((cred) => (
              <div
                key={`demo-${cred.role}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={() => autofill(cred)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && autofill(cred)}
              >
                <div className="flex items-center gap-3">
                  <span className={`badge-base text-xs ${cred.badgeColor}`}>{cred.role}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{cred.email}</p>
                    <p className="text-xs text-muted-foreground">{cred.badge}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCopy(cred.email, `${cred.role}-email`); }}
                    className="btn-icon text-muted-foreground hover:text-foreground"
                    title="Copy email"
                  >
                    {copiedField === `${cred.role}-email` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                  <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-muted">Use</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        New user?{' '}
        <button onClick={onSwitchToRegister} className="text-primary font-semibold hover:underline">
          Create account
        </button>
      </p>
    </div>
  );
}