'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { setStoredSession } from '@/lib/auth';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'staff';
  terms: boolean;
};

type RegisteredAccount = Pick<RegisterFormData, 'email' | 'password' | 'role'>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: { role: 'user' }
  });

  const password = watch('password');
  const selectedRole = watch('role');

  const onSubmit = (data: RegisterFormData) => {
    setLoading(true);
    // BACKEND INTEGRATION POINT: POST /api/auth/register with form data
    setTimeout(() => {
      const accounts: RegisteredAccount[] = JSON.parse(localStorage.getItem('mediconnect-accounts') || '[]');
      const accountExists = accounts.some((account) => account.email.toLowerCase() === data.email.toLowerCase());

      if (accountExists) {
        setLoading(false);
        return;
      }

      accounts.push({ email: data.email, password: data.password, role: data.role });
      localStorage.setItem('mediconnect-accounts', JSON.stringify(accounts));
      setStoredSession({ email: data.email, role: data.role, name: data.name });
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  if (success) {
    return (
      <div className="text-center py-8 fade-in">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <UserPlus size={28} className="text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Account Created!</h3>
        <p className="text-muted-foreground text-sm mb-6">Your account is pending approval. You can now sign in with your credentials.</p>
        <button onClick={onSwitchToLogin} className="btn-primary w-full justify-center">
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="label-text" htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            placeholder="Dr. Priya Sharma"
            className={`input-field ${errors.name ? 'border-danger ring-1 ring-danger' : ''}`}
            {...register('name', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="label-text" htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            placeholder="priya.sharma@hospital.in"
            className={`input-field ${errors.email ? 'border-danger ring-1 ring-danger' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
            })}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="label-text">Account Type</label>
          <p className="helper-text mb-2">Staff accounts require admin approval before activation</p>
          <div className="grid grid-cols-2 gap-3">
            {(['user', 'staff'] as const).map((role) => (
              <label
                key={`role-${role}`}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  selectedRole === role
                    ? 'border-primary bg-secondary' :'border-border bg-card hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  value={role}
                  className="sr-only"
                  {...register('role')}
                />
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === role ? 'border-primary' : 'border-border'
                }`}>
                  {selectedRole === role && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">{role}</p>
                  <p className="text-xs text-muted-foreground">{role === 'user' ? 'Patient / Public' : 'Hospital Staff'}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="label-text" htmlFor="reg-password">Password</label>
          <p className="helper-text mb-1.5">Minimum 8 characters with a number and symbol</p>
          <div className="relative">
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              placeholder="Create a strong password"
              className={`input-field pr-10 ${errors.password ? 'border-danger ring-1 ring-danger' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: { value: /^(?=.*[0-9])(?=.*[!@#$%^&*])/, message: 'Must include a number and a symbol' }
              })}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label-text" htmlFor="reg-confirm">Confirm Password</label>
          <div className="relative">
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              className={`input-field pr-10 ${errors.confirmPassword ? 'border-danger ring-1 ring-danger' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val: string) => val === password || 'Passwords do not match'
              })}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirm ? 'Hide' : 'Show'}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-border text-primary cursor-pointer flex-shrink-0"
              {...register('terms', { required: 'You must accept the terms to continue' })}
            />
            <span className="text-sm text-foreground">
              I agree to the{' '}
              <button type="button" className="text-primary font-medium hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-primary font-medium hover:underline">Privacy Policy</button>
            </span>
          </label>
          {errors.terms && <p className="error-text mt-1">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Creating account...</>
          ) : (
            <><UserPlus size={16} /> Create Account</>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-primary font-semibold hover:underline">Sign in</button>
      </p>
    </div>
  );
}
