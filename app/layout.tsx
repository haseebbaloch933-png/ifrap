import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AccessibilityProvider } from '@/lib/accessibility-context';
import { I18nProvider } from '@/lib/i18n-context';
import { RBACProvider } from '@/lib/rbac-context';
import { AuthProvider } from '@/components/AuthProvider';
import { NavbarHeader } from '@/components/NavbarHeader';
import { PwaRegister } from '@/components/PwaRegister';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Applied Anthropology WebGIS & M&E Telemetry Dashboard',
  description: 'Integrative Decolonial WebGIS, Senian Multidimensional Poverty Index (MPI) Analytics, & Fiduciary Usufruct Ledger for Balochistan Water Infrastructure.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WB-IFRAP M&E',
  },
  keywords: [
    'Applied Anthropology',
    'WebGIS',
    'Balochistan Karez',
    'Senian MPI',
    'IFRAP Component 3',
    'Indigenous Technical Knowledge',
    'Usufruct Rights',
    'Telemetry Dashboard',
  ],
  authors: [{ name: 'Applied Anthropology Research Team' }],
  metadataBase: new URL('https://anthropologyportfolio.vercel.app'),
  openGraph: {
    title: 'Applied Anthropology WebGIS & M&E Telemetry',
    description: 'Decolonial spatial analytics and Senian capability metrics for water resource management.',
    url: 'https://anthropologyportfolio.vercel.app',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} dark scroll-smooth`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Applied Anthropology & WebGIS Consulting',
              description: 'Decolonial WebGIS, Senian Multidimensional Poverty Index (MPI) Analytics, & Fiduciary Usufruct Ledger for Balochistan Water Infrastructure.',
              url: 'https://anthropologyportfolio.vercel.app',
            }).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col selection:bg-emerald-500/30 selection:text-emerald-50">
        <AuthProvider>
          <AccessibilityProvider>
            <I18nProvider>
              <RBACProvider>
                {/* Global Institutional Header & Navbar */}
                <NavbarHeader />
  
                {/* Main Content Area */}
                <main id="main-content" tabIndex={-1} className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 focus:outline-none">
                  {children}
                </main>

                {/* PWA Service Worker Registration & Status Banner */}
                <PwaRegister />
  
                {/* Global Institutional Footer */}
                <footer role="contentinfo" className="border-t border-slate-800 bg-slate-900 py-8 mt-auto">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <div>
                      <p className="font-semibold text-slate-200">
                        Applied Anthropology Portfolio & M&E Telemetry
                      </p>
                      <p className="mt-1">
                        Integrating Indigenous Technical Knowledge (ITK) & Senian Capability Deprivation Index for IFRAP Component 3.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>Balochistan Karez Systems</span>
                      <span>•</span>
                      <span>Usufruct Digital Ledger</span>
                      <span>•</span>
                      <span>MapLibre GL JS</span>
                    </div>
                  </div>
                </footer>
              </RBACProvider>
            </I18nProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

