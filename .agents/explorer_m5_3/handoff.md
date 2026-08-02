# Milestone 5 (SEO Indexing & Test Suite Verification) Exploration Handoff Report

**Author**: Explorer 3 (Milestone 5)  
**Target Specifications**: `app/robots.ts`, `app/sitemap.ts`, `tests/e2e/tier1_ui_arch.test.js`, `tests/e2e/tier5_seo_hardening.test.js`  
**Date**: 2026-07-23  

---

## 1. Observation

Direct code observations from the project repository (`C:\Users\Administrator\teamwork_projects\anthropology_portfolio`):

1. **Existing Codebase Static File & App Router Setup**:
   - `app/` directory contents (`app/globals.css`, `app/layout.tsx`, `app/page.tsx`).
   - `public/` directory does **not** exist in the repository root.
   - Neither `app/robots.ts` nor `public/robots.txt` currently exist.
   - Neither `app/sitemap.ts` nor `public/sitemap.xml` currently exist.
   - `package.json` specifies Next.js version `"next": "^14.2.15"`.

2. **Existing Test Suite Infrastructure**:
   - `package.json` defines test execution via `"test": "node tests/run-tests.js"`.
   - Test framework is a **zero-dependency Node.js native test runner** using `node:test` and `assert`.
   - `tests/run-tests.js` orchestrates 5 test tiers across `tests/e2e/tier1_ui_arch.test.js` through `tier5_seo_hardening.test.js`.
   - `tests/utils/ast-helpers.js` provides static file assertion helpers: `assertFileExists`, `assertContains`, `assertExportExists`, `assertImports`, `parseJsonLd`, `fileExists`, `getFileContent`.
   - `tier1_ui_arch.test.js` currently tests layout metadata and basic JSON-LD script presence (`TC-T1-F5-01` to `TC-T1-F5-05`).
   - `tier5_seo_hardening.test.js` currently tests JSON-LD schema validity (`TC-T5-04`).
   - Neither `tier1_ui_arch.test.js` nor `tier5_seo_hardening.test.js` currently verify `app/robots.ts` or `app/sitemap.ts`.

---

## 2. Logic Chain

### 2.1 Next.js App Router File-Based Metadata Route Conventions
Next.js 14 App Router provides built-in TypeScript file-based metadata routes (`app/robots.ts` and `app/sitemap.ts`) over static files in `public/`.

- **`app/robots.ts` vs `public/robots.txt`**:
  - `public/robots.txt` is static and un-typed.
  - `app/robots.ts` uses Next.js native `MetadataRoute.Robots` type contract. Next.js automatically serves this file at `/robots.txt` at build time or request time.
  - Allows dynamic base URL resolution using `process.env.NEXT_PUBLIC_SITE_URL || 'https://anthropogis.org'`.

- **`app/sitemap.ts` vs `public/sitemap.xml`**:
  - `public/sitemap.xml` requires manual XML maintenance and can easily fall out of sync with new application routes.
  - `app/sitemap.ts` uses Next.js native `MetadataRoute.Sitemap` type contract. Next.js automatically compiles and serves this as XML at `/sitemap.xml`.
  - Guarantees proper URL formatting, dynamic `lastModified` timestamp generation (`new Date()`), explicit `changeFrequency` enums, and valid numeric `priority` ratings (0.0 to 1.0).

### 2.2 Blueprint Content Specifications

#### A. `app/robots.ts` Blueprint
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anthropogis.org';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/private/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

#### B. `app/sitemap.ts` Blueprint
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anthropogis.org';
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/telemetry`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/webgis`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/usufruct`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
```

### 2.3 Test Suite Requirements Specification
The project uses a zero-dependency Node.js native test runner (`node tests/run-tests.js`). The test requirements for SEO Indexing files MUST be integrated into this framework.

#### Test Cases to Add / Verify:
1. `TC-T1-F5-06: Next.js Robots Metadata Route Export Verification` (Tier 1):
   - Asserts `app/robots.ts` file existence using `assertFileExists('app/robots.ts')`.
   - Asserts default export function using `assertExportExists('app/robots.ts', 'default')` or `assertContains('app/robots.ts', 'export default function robots')`.
   - Asserts inclusion of `userAgent`, `allow`, and `sitemap` reference to `sitemap.xml`.

2. `TC-T1-F5-07: Next.js Sitemap Metadata Route Export Verification` (Tier 1):
   - Asserts `app/sitemap.ts` file existence using `assertFileExists('app/sitemap.ts')`.
   - Asserts default export function using `assertExportExists('app/sitemap.ts', 'default')` or `assertContains('app/sitemap.ts', 'export default function sitemap')`.
   - Asserts presence of primary routes (`telemetry`, `webgis`, `usufruct`, `portfolio`, `contact`) and `MetadataRoute.Sitemap` import.

3. `TC-T5-07: SEO Indexing Files Hardening & Sitemap Bounds Integrity` (Tier 5):
   - Evaluates sitemap route definitions for valid priority range ($0.0 \le priority \le 1.0$) and valid `changeFrequency` enum values (`'always'`, `'hourly'`, `'daily'`, `'weekly'`, `'monthly'`, `'yearly'`, `'never'`).
   - Verifies `robots.ts` user-agent rules permit indexing of public routes while properly linking the full sitemap URL.

---

## 3. Caveats

1. **Static vs Dynamic Generation**: Under Next.js App Router, `app/robots.ts` and `app/sitemap.ts` are evaluated during `next build` to produce static output files unless dynamic server features (like headers or searchParams) are used.
2. **Read-Only Scope**: Explorer 3 operates strictly in read-only mode for project code. File creation of `app/robots.ts` and `app/sitemap.ts`, as well as test file updates, will be carried out by Implementer agents.

---

## 4. Conclusion

- Standard Next.js App Router metadata file routes (`app/robots.ts` and `app/sitemap.ts`) are superior to static files in `public/` as they leverage native TypeScript types (`MetadataRoute.Robots` and `MetadataRoute.Sitemap`) and environment-aware base URLs.
- The blueprints provided cover all public routes (`/`, `/telemetry`, `/webgis`, `/usufruct`, `/portfolio`, `/projects`, `/contact`) with appropriate priority ratings and update frequencies.
- The custom test suite in `tests/e2e/` can be seamlessly expanded with static AST and structural assertions (`TC-T1-F5-06`, `TC-T1-F5-07`, and `TC-T5-07`) using `tests/utils/ast-helpers.js`.

---

## 5. Verification Method

To independently verify the implementation once executed:

1. **File Existence & AST Assertions**:
   - Verify `app/robots.ts` exists and default-exports `robots()`.
   - Verify `app/sitemap.ts` exists and default-exports `sitemap()`.
2. **Next.js Build Verification**:
   - Run `npm run build` or `npx next build`.
   - Check that output logs show `/robots.txt` and `/sitemap.xml` generated as dynamic or static metadata routes.
3. **E2E Test Runner Execution**:
   - Run `npm test` or `node tests/run-tests.js`.
   - Ensure all tests in Tier 1 through Tier 5 pass with 100% pass rate.
