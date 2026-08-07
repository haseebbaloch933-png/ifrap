/**
 * Canonical public base URL of the deployment.
 *
 * Set `NEXT_PUBLIC_SITE_URL` per environment (e.g. in Vercel → Project
 * Settings → Environment Variables) to the site's absolute origin, with no
 * trailing slash — e.g. `https://mirab.ifrap.gov.pk`. It is consumed by:
 *   - app/layout.tsx  — `metadataBase` + OpenGraph URL
 *   - app/robots.ts   — the sitemap URL
 *   - lib/json-ld.ts  — JSON-LD structured-data URLs
 *
 * When unset, it falls back to the current Vercel deployment origin so local
 * dev and preview builds still work. Any trailing slashes are trimmed so
 * callers can safely do `${SITE_URL}/path`.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://anthropologyportfolio.vercel.app'
).replace(/\/+$/, '');
