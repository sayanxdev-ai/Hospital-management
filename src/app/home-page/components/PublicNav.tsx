'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Phone } from 'lucide-react';
import { isSignedIn } from '@/lib/auth';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Medicines', href: '/#medicines' },
  { label: 'Blood Bank', href: '/#blood-bank' },
  { label: 'Medical Supplies', href: '/#supplies' },
];

export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-card/95 backdrop-blur-md shadow-card border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo size={36} />
            <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-foreground' : 'text-white'}`}>
              MediConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks?.map((link) => (
              <Link
                key={`nav-${link?.label}`}
                href={link?.href}
                onClick={(event) => {
                  const protectedSections = ['/#medicines', '/#blood-bank', '/#supplies'];
                  const shouldProtect = protectedSections.includes(link?.href ?? '');

                  if (shouldProtect && !isSignedIn()) {
                    event.preventDefault();
                    window.location.href = '/sign-up-login-screen';
                    return;
                  }

                  if (shouldProtect && window.location.pathname === '/') {
                    event.preventDefault();
                    window.location.href = link.href;
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  scrolled
                    ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+911800112333"
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                scrolled ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'
              }`}
            >
              <Phone size={14} />
              <span>1800-112-333</span>
            </a>
            <Link
              href="/sign-up-login-screen"
              className="btn-primary btn-sm px-4 py-2 text-sm"
            >
              Staff Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-t border-border shadow-card-md fade-in">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks?.map((link) => (
              <Link
                key={`mobile-nav-${link?.label}`}
                href={link?.href}
                className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={(event) => {
                  const protectedSections = ['/#medicines', '/#blood-bank', '/#supplies'];
                  const shouldProtect = protectedSections.includes(link?.href ?? '');

                  if (shouldProtect && !isSignedIn()) {
                    event.preventDefault();
                    window.location.href = '/sign-up-login-screen';
                    return;
                  }

                  setMenuOpen(false);
                }}
              >
                {link?.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border mt-2">
              <Link
                href="/sign-up-login-screen"
                className="btn-primary w-full justify-center"
                onClick={() => setMenuOpen(false)}
              >
                Staff / Admin Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}