# Frontend Architecture Analysis & Refactoring Recommendations
**Project**: Applied Anthropology WebGIS & M&E Telemetry Dashboard  
**Author**: Explorer 3  
**Date**: 2026-07-31  

---

## Executive Summary

This report provides a comprehensive analysis of the front-end structure (`app/layout.tsx`, `app/globals.css`, `tailwind.config.js`), accessibility setup, internationalization (i18n & RTL), Role-Based Access Control (RBAC), and testing harness (`tests/`).

Key findings include:
1. **Accessibility (WCAG 2.1 AA)**: Current components (`TelemetryDashboard.tsx`, `UsufructGenerator.tsx`, `DecolonialMap.tsx`, `app/layout.tsx`) rely heavily on visual styles (`backdrop-blur`, custom gradient spans, color badges) but lack key WCAG 2.1 AA features such as explicit `aria-*` tags, keyboard focus rings (`focus-visible`), skip links, semantic regions, and high-contrast accessibility mode overrides.
2. **Localization (EN/UR & RTL)**: No existing i18n context exists. Urdu support requires bidirectional text handling (`dir="rtl"`), dynamic document attributes (`<html lang="ur" dir="rtl">`), dictionary mappings for specialized anthropological and technical terms (e.g., Karez, Mirab, Senian MPI, Usufruct), and font styling adjustments for Urdu script.
3. **Role-Based Access Control (RBAC)**: The application currently renders all administrative, fiduciary, and financial metrics to any user. Field Enumerators must be restricted from sensitive widgets such as financial burn rate, fiduciary audit logs, and project budget allocations while maintaining access to WebGIS maps and field survey inputs.
4. **Test Harness & Build Verification**: `tests/run-tests.js` is a zero-dependency native Node.js test runner executing 80 E2E tests across 5 tiers with a 98.75% pass rate (79/80 passed). The single failing test (`TC-T1-F2-02`) is caused by `components/DecolonialMap.tsx` importing from `'react-map-gl/maplibre'` instead of `'mapbox-gl'`. Build verification (`npm run build`) compiles cleanly in Next.js 14.2.35.

---

## 1. WCAG 2.1 AA Accessibility Architecture

### 1.1 Current Accessibility Gaps
- **Landmark Regions**: `app/layout.tsx` uses `<header>`, `<main>`, `<footer>`, but inner pages (`app/page.tsx`, `components/TelemetryDashboard.tsx`) lack structural `<section aria-label="...">` or `<article>` wrappers with proper heading hierarchies (`h1` -> `h2` -> `h3`).
- **Form & Control Labeling**: `components/UsufructGenerator.tsx` form controls lack explicit `id` and `htmlFor` bindings (e.g., `label` elements do not reference `id`s of inputs).
- **Interactive State Attributes**: Filter buttons in `TelemetryDashboard.tsx` (lines 209-234, 352-370) use `button` elements without `aria-selected`, `aria-pressed`, or `role="tab"`.
- **Focus Ring & Keyboard Navigation**: Custom buttons use `hover:` states without visible `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none` focus indicators.
- **Color Contrast & High-Contrast Mode**: Dark glassmorphic palette (`bg-slate-950`, `text-slate-400`, `text-slate-500`) has text contrast ratios below 4.5:1 on certain muted descriptions. A dedicated High-Contrast mode is needed to comply with WCAG 2.1 AA contrast requirements (>= 4.5:1 normal text, >= 3:1 large text / UI components).

### 1.2 Recommendations & Implementation Blueprint

#### A. Skip-to-Content Link & Structural Landmarks (`app/layout.tsx`)
```tsx
// Insert as first child of <body> in app/layout.tsx:
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-cyan-500 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-xl focus:outline-none"
>
  Skip to main content
</a>
<main id="main-content" tabIndex={-1} className="...">
  {children}
</main>
```

#### B. High-Contrast Mode Toggle & Context Provider
Create `contexts/AccessibilityContext.tsx`:
```tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  highContrast: false,
  toggleHighContrast: () => {},
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('accessibility_high_contrast');
    if (saved === 'true') setHighContrast(true);
  }, []);

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('accessibility_high_contrast', String(next));
      return next;
    });
  };

  return (
    <AccessibilityContext.Provider value={{ highContrast, toggleHighContrast }}>
      <div className={highContrast ? 'high-contrast-mode' : ''}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
```

#### C. High-Contrast Styles in `app/globals.css`
Add WCAG 2.1 AA high-contrast overrides:
```css
/* High Contrast Mode Overrides */
.high-contrast-mode {
  --background: 0 0 0;
  --foreground: 255 255 255;
}

.high-contrast-mode .glass-card,
.high-contrast-mode .glass-panel,
.high-contrast-mode .glass-nav {
  background: #000000 !important;
  border: 2px solid #ffffff !important;
  box-shadow: none !important;
  color: #ffffff !important;
}

.high-contrast-mode .text-slate-400,
.high-contrast-mode .text-slate-500,
.high-contrast-mode .text-slate-300 {
  color: #ffffff !important;
}

.high-contrast-mode .text-cyan-400,
.high-contrast-mode .text-emerald-400 {
  color: #ffff00 !important; /* Yellow for high contrast links/accents */
}

.high-contrast-mode button,
.high-contrast-mode a,
.high-contrast-mode input,
.high-contrast-mode select {
  border: 2px solid #ffffff !important;
  outline-offset: 3px !important;
}

.high-contrast-mode *:focus-visible {
  outline: 3px solid #ffff00 !important;
  outline-offset: 2px !important;
}
```

---

## 2. English (EN) / Urdu (UR) Localization Context (i18n) & RTL Support

### 2.1 Requirements & Technical Design
- **Supported Languages**: English (`en`, LTR) and Urdu (`ur`, RTL).
- **Text Direction**: Set `dir="rtl"` on root element / wrapper when Urdu is active; update `<html lang="ur" dir="rtl">`.
- **Typography & Font Fallbacks**: Urdu requires specialized font rendering (e.g. `'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Tahoma', 'Arial', sans-serif`). Line heights for Urdu text need to be set to `leading-loose` or `leading-relaxed` (1.8 - 2.0x) to avoid vertical clipping of nastaliq diacritics.

### 2.2 Translation Dictionaries Blueprint (`lib/i18n/translations.ts`)
```typescript
export type Language = 'en' | 'ur';

export interface TranslationDictionary {
  nav: {
    overview: string;
    webgis: string;
    telemetry: string;
    fiduciary: string;
    systemOnline: string;
  };
  telemetry: {
    title: string;
    subtitle: string;
    selectDistrict: string;
    mpiScore: string;
    headcountRatio: string;
    povertyIntensity: string;
    financialBurnRate: string;
    downloadReport: string;
  };
  roles: {
    enumerator: string;
    officer: string;
    director: string;
    currentRole: string;
  };
  usufruct: {
    title: string;
    beneficiary: string;
    parcelId: string;
    area: string;
    generate: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      overview: 'Overview',
      webgis: 'WebGIS Map',
      telemetry: 'Telemetry Dashboard',
      fiduciary: 'Fiduciary Shield',
      systemOnline: 'System Online',
    },
    telemetry: {
      title: 'Senian Multidimensional Poverty Index & Telemetry Dashboard',
      subtitle: 'Quantitative M&E monitoring of Balochistan Karez Rehabilitation & Community Water Management (IFRAP Component 3).',
      selectDistrict: 'Select IFRAP District',
      mpiScore: 'MPI Score',
      headcountRatio: 'Headcount Ratio (H)',
      povertyIntensity: 'Poverty Intensity (A)',
      financialBurnRate: 'Financial Burn Rate & Budget Allocation',
      downloadReport: 'Download Report',
    },
    roles: {
      enumerator: 'Field Enumerator',
      officer: 'Provincial PIU Officer',
      director: 'FPMU Director',
      currentRole: 'Current Role',
    },
    usufruct: {
      title: 'Customary Legal Rights Generator',
      beneficiary: 'Beneficiary / Clan Name',
      parcelId: 'Land Parcel ID',
      area: 'Area (Hectares)',
      generate: 'Generate Customary Usufruct Certificate',
    },
  },
  ur: {
    nav: {
      overview: 'جائزہ',
      webgis: 'ویب جی آئی ایس نقشہ',
      telemetry: 'ٹیلی میٹری ڈیش بورڈ',
      fiduciary: 'فڈیوشری شیلڈ',
      systemOnline: 'سسٹم آن لائن',
    },
    telemetry: {
      title: 'سینیئن کثیر جہتی غربت کا انڈیکس اور ٹیلی میٹری ڈیش بورڈ',
      subtitle: 'بلوچستان کاریز کی بحالی اور کمیونٹی واٹر مینجمنٹ کی مقدار کے لحاظ سے نگرانی (IFRAP جزو 3)۔',
      selectDistrict: 'IFRAP ضلع منتخب کریں',
      mpiScore: 'ایم پی آئی اسکور',
      headcountRatio: 'ہیڈ کاؤنٹ تناسب (H)',
      povertyIntensity: 'غربت کی شدت (A)',
      financialBurnRate: 'مالیاتی خرچ کا تناسب اور بجٹ کی تخصیص',
      downloadReport: 'رپورٹ ڈاؤن لوڈ کریں',
    },
    roles: {
      enumerator: 'فیلڈ شمار کنندہ',
      officer: 'صوبائی پی آئی یو آفیسر',
      director: 'ایف پی ایم یو ڈائریکٹر',
      currentRole: 'موجودہ عہدہ',
    },
    usufruct: {
      title: 'روایتی قانونی حقوق کا سرٹیفکیٹ جنریٹر',
      beneficiary: 'مستفید کنندہ / قبیلے کا نام',
      parcelId: 'زمین کا پارسل آئی ڈی',
      area: 'رقبہ (ہیکٹر)',
      generate: 'روایتی حقِ انتفاع سرٹیفکیٹ جاری کریں',
    },
  },
};
```

### 2.3 i18n Context Provider (`contexts/I18nContext.tsx`)
```tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationDictionary } from '@/lib/i18n/translations';

interface I18nContextType {
  language: Language;
  dir: 'ltr' | 'rtl';
  t: TranslationDictionary;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  dir: 'ltr',
  t: translations.en,
  setLanguage: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved === 'en' || saved === 'ur') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  };

  const dir = language === 'ur' ? 'rtl' : 'ltr';
  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, dir, t, setLanguage }}>
      <div dir={dir} className={language === 'ur' ? 'font-urdu leading-relaxed' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
```

---

## 3. Role-Based Access Control (RBAC) Architecture

### 3.1 Role Hierarchy & Permissions Matrix

| User Role | Role Key | Allowed Capabilities | Restricted Views / Actions |
|---|---|---|---|
| **Field Enumerator** | `FIELD_ENUMERATOR` | View WebGIS maps, submit basic field survey records, view public telemetry metrics | **HIDDEN**: Financial burn rate widgets, budget allocations, compliance audit ledger, executive report export, system config |
| **Provincial PIU Officer** | `PROVINCIAL_PIU` | View WebGIS, full district telemetry, approve field survey data, export CSV/JSON reports | **HIDDEN**: Federal budget adjustments, system-wide admin overrides |
| **FPMU Director** | `FPMU_DIRECTOR` | Unrestricted full access to all spatial maps, telemetry dashboards, fiduciary ledgers, financial burn rate widgets, audit logs | **NONE** (Full Access) |

### 3.2 RBAC Context & Custom Hook (`contexts/RBACContext.tsx`)
```tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'FIELD_ENUMERATOR' | 'PROVINCIAL_PIU' | 'FPMU_DIRECTOR';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  district?: string;
}

interface RBACContextType {
  user: UserProfile;
  setRole: (role: UserRole) => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_001',
  name: 'Field Survey Staff',
  role: 'FIELD_ENUMERATOR',
  district: 'Quetta',
};

const RBACContext = createContext<RBACContextType>({
  user: DEFAULT_USER,
  setRole: () => {},
  hasPermission: () => false,
});

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    const savedRole = localStorage.getItem('user_active_role') as UserRole;
    if (savedRole && ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'].includes(savedRole)) {
      setUser((prev) => ({ ...prev, role: savedRole }));
    }
  }, []);

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
    localStorage.setItem('user_active_role', role);
  };

  const hasPermission = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(user.role);
  };

  return (
    <RBACContext.Provider value={{ user, setRole, hasPermission }}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => useContext(RBACContext);

/** Guard Component for Conditional Rendering */
export const RoleGate: React.FC<{
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ allowedRoles, children, fallback = null }) => {
  const { hasPermission } = useRBAC();
  if (!hasPermission(allowedRoles)) return <>{fallback}</>;
  return <>{children}</>;
};
```

### 3.3 Protecting Sensitive Widgets Example (`components/FinancialBurnRateWidget.tsx`)
```tsx
'use client';
import React from 'react';
import { GlassCard } from '@/components/GlassCard';
import { RoleGate } from '@/contexts/RBACContext';

export function FinancialBurnRateWidget() {
  return (
    <RoleGate
      allowedRoles={['PROVINCIAL_PIU', 'FPMU_DIRECTOR']}
      fallback={
        <GlassCard glowColor="none" className="bg-slate-900/30 border-dashed border-slate-700/50">
          <div className="p-4 text-center text-xs text-slate-400">
            <span className="font-mono text-amber-400">RESTRICTED VIEW:</span> Financial burn rate & fiduciary metrics are accessible only to Provincial PIU Officers & FPMU Directors.
          </div>
        </GlassCard>
      }
    >
      <GlassCard glowColor="amber" className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Financial Burn Rate & Budget Allocation</h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>Total Allocated: <span className="text-emerald-400 font-bold">$4.25M</span></div>
          <div>Disbursed: <span className="text-amber-400 font-bold">$2.80M (65.8%)</span></div>
        </div>
      </GlassCard>
    </RoleGate>
  );
}
```

---

## 4. Test Harness Analysis & Build Verification

### 4.1 Architecture of `tests/`
The test runner is built natively with zero third-party framework dependencies:
- **Orchestrator (`tests/run-tests.js`)**: Loads test files iteratively, executes tests wrapped in a 5-second timeout, handles failure logging, and passes statistics to `TestReporter`.
- **AST & Static Helpers (`tests/utils/ast-helpers.js`)**:
  - `assertFileExists(path)`: Checks presence of expected files.
  - `assertContains(path, stringOrRegex)`: Regex/string matching.
  - `assertImports(path, moduleName)`: Regex matching `import ... from 'moduleName'` or `require('moduleName')`.
  - `assertExportExists(path, exportName)`: Validates named or default TypeScript exports.
- **Mock Environments (`tests/utils/mock-context.js`)**: Mocks `window`, `localStorage`, Mapbox GL instance methods (`addSource`, `addLayer`, `flyTo`), and Firebase Firestore APIs (`collection`, `add`, `doc`, `set`).
- **Reporter & Publisher (`tests/utils/test-reporter.js`)**: Summarizes results into `tests/reports/e2e-report.json` and updates `TEST_READY.md`.

### 4.2 Failure Analysis (`TC-T1-F2-02`)
- **Observed Result**: 79 / 80 tests passed (98.75%). Single failure in Tier 1 (`TC-T1-F2-02: Mapbox GL JS Library Import Specification`).
- **Error Stack**: `Error: Expected components/DecolonialMap.tsx to import "mapbox-gl"`.
- **Root Cause**: `components/DecolonialMap.tsx` line 4 imports from `'react-map-gl/maplibre'` instead of `'mapbox-gl'`.
- **Recommended Remediation**: To satisfy the test assertion contract while maintaining Maplibre fallback compatibility, update `components/DecolonialMap.tsx` import line to explicitly reference `mapbox-gl` or aliased Mapbox import, or update the test contract helper to accept `react-map-gl/maplibre` / `maplibre-gl`.

### 4.3 Build & Widget Mounting Verification
- **Build Verification**: `cmd /c "npm run build"` compiles cleanly with 0 TypeScript or Next.js layout errors. Generated static routes: `/`, `/fiduciary`, `/telemetry`, `/webgis`, and `/api/export`.
- **Widget Mounting Rules**:
  - All interactive client widgets (`TelemetryDashboard.tsx`, `DecolonialMap.tsx`, `UsufructGenerator.tsx`) must retain `'use client'` directive at line 1.
  - Window or document dependent initializers (such as `localStorage` reads) must execute inside `useEffect` to prevent SSR hydration mismatch during static pre-rendering.

---

## 5. Summary of Recommended Provider Hierarchy (`app/layout.tsx`)

To integrate Accessibility, i18n/RTL, and RBAC seamlessly into `app/layout.tsx`:

```tsx
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { RBACProvider } from '@/contexts/RBACContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`}>
      <head>...</head>
      <body className="...">
        <AccessibilityProvider>
          <I18nProvider>
            <RBACProvider>
              <a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>
              <HeaderNavbar />
              <main id="main-content" tabIndex={-1} className="...">
                {children}
              </main>
              <Footer />
            </RBACProvider>
          </I18nProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
```

---
*Analysis completed by Explorer 3.*
