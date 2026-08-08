'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { useRBAC, type UserRole } from '@/lib/rbac-context';

export function NavbarHeader() {
  const { t, language, setLanguage } = useI18n();
  const { role } = useRBAC();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // These dashboards don't call useI18n anywhere yet — showing Urdu on them
  // would flip the shared nav to Urdu while the page content stays English.
  // Hide the toggle there, and force the language back to English on entry
  // (below) so arriving with Urdu already selected elsewhere can't leave the
  // shell and the page out of sync. Drop an entry here once a route's i18n
  // coverage is complete.
  const UNTRANSLATED_ROUTES = ['/esf-telemetry', '/field-log', '/grm', '/gis-impact', '/me-results', '/admin'];
  const isUntranslatedRoute = UNTRANSLATED_ROUTES.some((r) => pathname === r || pathname?.startsWith(`${r}/`));
  const showLanguageToggle = !isUntranslatedRoute;

  useEffect(() => {
    if (isUntranslatedRoute && language !== 'en') {
      setLanguage('en');
    }
  }, [isUntranslatedRoute, language, setLanguage]);

  // Single source of truth for nav links. `title` decodes each domain acronym
  // on hover so first-time viewers aren't lost, without stripping the
  // professional terminology. `label` is the compact desktop text; `mobileLabel`
  // is the fuller name shown where the mobile menu has room. `roles`, when set,
  // hides the link from anyone whose session role isn't listed — omit it for
  // links every authenticated role can reach.
  const navItems: Array<{ href: string; label: string; mobileLabel: string; title: string; roles?: UserRole[] }> = [
    { href: '/', label: t.nav.overview, mobileLabel: t.nav.overview, title: 'Project overview and key impact indicators' },
    { href: '/esf-telemetry', label: 'ESF Telemetry', mobileLabel: 'ESF Telemetry Portal', title: 'Environmental & Social Framework (ESF) — safeguards compliance matrix' },
    { href: '/field-log', label: 'Field Log', mobileLabel: 'Field Anthropologist Log', title: 'Field anthropologist daily reports and observations' },
    { href: '/grm', label: 'GRM Center', mobileLabel: 'GRM Ticketing Center', title: 'Grievance Redress Mechanism (GRM) — log and track community complaints' },
    { href: '/gis-impact', label: 'GIS Mapper', mobileLabel: 'GIS Impact Mapper', title: 'Geographic Information System (GIS) — water infrastructure impact map' },
    { href: '/me-results', label: 'M&E Engine', mobileLabel: 'M&E Results Engine', title: 'Monitoring & Evaluation (M&E) — results and analytics dashboard' },
    { href: '/results-framework', label: 'Results Framework', mobileLabel: 'Results Framework (Draft)', title: 'World Bank IPF Results Framework — PDO & intermediate indicators (draft scaffold pending official PAD RF)' },
    { href: '/admin', label: t.nav.admin, mobileLabel: t.nav.admin, title: 'Administrator console — manage users, roles, and settings', roles: ['FPMU_DIRECTOR'] },
  ];

  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <>
      {/* Skip-to-Content Link for WCAG 2.1 AA Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:font-bold focus:rounded-sm focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-800"
      >
        {t.nav.skipToContent}
      </a>

      {/* Global Institutional Header & Navbar */}
      <header role="banner" className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Logo & Branding */}
          <Link 
            href="/" 
            aria-label={`${t.nav.appTitle} - ${t.nav.appSubtitle}`}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-sm p-1 min-h-[44px] min-w-[44px]"
          >
            <div className="w-10 h-10 bg-slate-800 border border-slate-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-wide">
                {t.nav.appTitle}
              </span>
              <span className="hidden sm:block text-xs text-slate-400 font-medium tracking-wider uppercase">
                {t.nav.appSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                className="px-2.5 py-1.5 min-h-[36px] flex items-center text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Header Controls: Role Switcher, Language Switcher, High Contrast Switcher */}
          <div className="hidden md:flex items-center gap-2">
            {showLanguageToggle && <LanguageSwitcher />}
            <AccessibilityControls />
            <RoleSwitcher />
            <div className="items-center gap-2 px-3 py-1 bg-green-900 border border-green-700 text-green-100 text-xs font-mono flex">
              <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
              <span>{t.nav.systemOnline}</span>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-800 border-b border-slate-700 pb-4 px-4">
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-2 mt-2">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 min-h-[40px] flex items-center text-xs font-medium text-white hover:bg-slate-700 bg-slate-900 border border-slate-700"
                >
                  {item.mobileLabel}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-4 border-t border-slate-700 pt-4">
              <div className="flex gap-2">
                {showLanguageToggle && <LanguageSwitcher />}
                <AccessibilityControls />
              </div>
              <RoleSwitcher />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
