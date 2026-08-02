# Milestone 5 (SEO & JSON-LD Optimization) Exploration Handoff Report

**Author**: Explorer 2 (Milestone 5)  
**Target Architecture**: `app/layout.tsx`, `lib/json-ld.ts`, `components/JsonLd.tsx`  
**Date**: 2026-07-23  

---

## 1. Observation

Direct code observations from the project codebase (`C:\Users\Administrator\teamwork_projects\anthropology_portfolio`):

1. **`app/layout.tsx` (Lines 12–31, 38–141)**:
   - Layout currently exports a static `Metadata` object:
     ```typescript
     export const metadata: Metadata = {
       title: 'Applied Anthropology WebGIS & M&E Telemetry Dashboard',
       description: 'Integrative Decolonial WebGIS, Senian Multidimensional Poverty Index (MPI) Analytics, & Fiduciary Usufruct Ledger for Balochistan Water Infrastructure.',
       keywords: [
         'Applied Anthropology', 'WebGIS', 'Balochistan Karez', 'Senian MPI',
         'IFRAP Component 3', 'Indigenous Technical Knowledge', 'Usufruct Rights', 'Telemetry Dashboard'
       ],
       authors: [{ name: 'Applied Anthropology Research Team' }],
       openGraph: { ... }
     };
     ```
   - Layout renders `<html>`, `<body>`, global navigation header, ambient background grid, `<main>`, and `<footer>`.
   - **Gap**: Layout lacks structured JSON-LD `<script type="application/ld+json">` tags for machine-readable indexing of Person / ProfessionalService and Dataset / Project schemas.

2. **`PROJECT.md` Architecture Contract (Lines 30–33)**:
   - Explicitly defines:
     ```
     SEO & Layout (app/layout.tsx)
     - Exports metadata object (title, description, keywords, og:image)
     - Renders JSON-LD schema (<script type="application/ld+json">)
     ```

3. **`lib/utils.ts` (Lines 1–7)**:
   - Contains basic `cn()` styling utility. No metadata or JSON-LD helper utilities currently exist in `lib/`.

---

## 2. Logic Chain

### 2.1 Next.js App Router Safe JSON-LD Script Injection
In Next.js App Router server components (such as `app/layout.tsx`), structured data MUST be injected server-side so that search engine crawlers (Googlebot, Bingbot) parse the structured JSON-LD payload on initial HTTP response.
- **Recommended Injection Pattern**: Standard HTML `<script>` tag inside server layout using `dangerouslySetInnerHTML`.
- **XSS Prevention**: When stringifying JavaScript objects to JSON inside `<script>` tags, `<` characters must be escaped as `\u003c` to prevent context breaking (e.g. `</script>` injection):
  ```tsx
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(jsonLdData).replace(/</g, '\\u003c'),
    }}
  />
  ```

### 2.2 Schema Design Specifications

#### A. Person / ProfessionalService Schema (Applied Anthropologist Portfolio)
- **Primary Type**: `["Person", "ProfessionalService"]`
- **Identifier**: `https://anthropogis.org/#anthropologist`
- **Fields**:
  - `name`: `"Applied Anthropology Research Team"`
  - `jobTitle`: `"Senior Applied Anthropologist & Spatial Telemetry Specialist"`
  - `description`: `"Applied anthropologist specializing in customary water governance, Decolonial WebGIS, Senian Multidimensional Poverty Index (MPI) analytics, and IFRAP Component 3 usufruct land rights in Balochistan."`
  - `url`: `"https://anthropogis.org"`
  - `knowAbout`: `["WebGIS", "M&E telemetry", "applied anthropology", "spatial research", "Indigenous Technical Knowledge (ITK)", "Senian Multidimensional Poverty Index", "Karez Water Systems", "Usufruct Fiduciary Rights"]`
  - `areaServed`: `{ "@type": "AdministrativeArea", "name": "Balochistan, Pakistan" }`
  - `hasOfferCatalog`: Catalog of services offered (Spatial WebGIS Consulting, Senian MPI Capability Audits, Usufruct Rights Certification).

#### B. Dataset / Project Schema (WebGIS & Telemetry Dashboard)
- **Primary Type**: `Dataset` (referencing `ResearchProject`)
- **Identifier**: `https://anthropogis.org/#dataset`
- **Fields**:
  - `name`: `"Balochistan Karez WebGIS & IFRAP Component 3 Telemetry Dataset"`
  - `description`: `"Decolonial spatial telemetry dataset integrating customary Karez water management routes, ITK spatial boundaries, Senian Multidimensional Poverty Index (MPI) capability deprivation metrics (H x A), and Usufruct fiduciary land rights verification logs."`
  - `keywords`: `["WebGIS", "Balochistan Karez", "Senian MPI", "IFRAP Component 3", "Indigenous Technical Knowledge", "Usufruct Rights", "M&E Telemetry", "Spatial Research"]`
  - `creator`: `{ "@id": "https://anthropogis.org/#anthropologist" }`
  - `publisher`: `{ "@type": "Organization", "name": "Applied Anthropology Portfolio & Telemetry Platform", "url": "https://anthropogis.org" }`
  - `spatialCoverage`:
    ```json
    {
      "@type": "Place",
      "name": "Balochistan, Pakistan",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 30.1798,
        "longitude": 66.9750
      },
      "geoContains": {
        "@type": "GeoShape",
        "box": "27.8 60.9 31.9 70.2"
      }
    }
    ```
  - `measurementTechnique`: `["Decolonial Spatial Mapping", "Senian Multidimensional Poverty Index (H x A)", "Usufruct Digital Ledger Verification"]`
  - `variableMeasured`: `["Karez Channel Length (km)", "Flow Rate (L/s)", "Headcount Ratio (H)", "Average Deprivation Intensity (A)", "Multidimensional Poverty Index (MPI)", "Usufruct Rights Verification Status"]`

### 2.3 Single `@graph` Optimization
Instead of rendering multiple isolated `<script>` tags, combining nodes inside a single `@graph` array under `https://schema.org` provides cleaner HTML output, allows cross-referencing nodes using `@id` (e.g. `creator: { "@id": "https://anthropogis.org/#anthropologist" }`), and reduces bundle overhead.

### 2.4 Clean Architecture: Helper File & Dedicated Component

To keep `app/layout.tsx` clean and maintainable:
1. **`lib/json-ld.ts`**: Pure helper file generating valid schema objects.
2. **`components/JsonLd.tsx`**: Reusable component rendering the `<script>` tag.
3. **`app/layout.tsx`**: Includes `<JsonLd />` component inside `<body>`.

---

## 3. Implementation Code Blueprint

### 3.1 Proposed `lib/json-ld.ts`
```typescript
export function getPersonProfessionalSchema() {
  return {
    '@type': ['Person', 'ProfessionalService'],
    '@id': 'https://anthropogis.org/#anthropologist',
    name: 'Applied Anthropology Research Team',
    jobTitle: 'Senior Applied Anthropologist & Spatial Telemetry Specialist',
    description:
      'Applied anthropologist specializing in customary water governance, Decolonial WebGIS, Senian Multidimensional Poverty Index (MPI) analytics, and IFRAP Component 3 usufruct land rights in Balochistan.',
    url: 'https://anthropogis.org',
    image: 'https://anthropogis.org/og-image.jpg',
    knowAbout: [
      'WebGIS',
      'M&E telemetry',
      'applied anthropology',
      'spatial research',
      'Indigenous Technical Knowledge (ITK)',
      'Senian Multidimensional Poverty Index',
      'Karez Water Systems',
      'Usufruct Fiduciary Rights',
    ],
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Balochistan, Pakistan',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Applied Anthropology & Telemetry Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Decolonial WebGIS & Spatial Telemetry Consulting',
            description:
              'Customary Karez water system mapping and ITK spatial layer integration.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Senian MPI Capability Monitoring & Evaluation',
            description:
              'Quantitative M&E for multidimensional poverty deprivation (H x A) across IFRAP Component 3 sites.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Fiduciary Usufruct Rights Ledger Certification',
            description:
              'Customary land tenure and legal protection ledger for indigenous water rights.',
          },
        },
      ],
    },
  };
}

export function getDatasetSchema() {
  return {
    '@type': 'Dataset',
    '@id': 'https://anthropogis.org/#dataset',
    name: 'Balochistan Karez WebGIS & IFRAP Component 3 Telemetry Dataset',
    description:
      'Decolonial spatial telemetry dataset integrating customary Karez water management routes, ITK spatial boundaries, Senian Multidimensional Poverty Index (MPI) capability deprivation metrics (H x A), and Usufruct fiduciary land rights verification logs.',
    url: 'https://anthropogis.org/webgis',
    keywords: [
      'WebGIS',
      'Balochistan Karez',
      'Senian MPI',
      'IFRAP Component 3',
      'Indigenous Technical Knowledge',
      'Usufruct Rights',
      'M&E Telemetry',
      'Spatial Research',
    ],
    creator: {
      '@id': 'https://anthropogis.org/#anthropologist',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Applied Anthropology Portfolio & Telemetry Platform',
      url: 'https://anthropogis.org',
    },
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    spatialCoverage: {
      '@type': 'Place',
      name: 'Balochistan, Pakistan',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 30.1798,
        longitude: 66.975,
      },
      geoContains: {
        '@type': 'GeoShape',
        box: '27.8 60.9 31.9 70.2',
      },
    },
    measurementTechnique: [
      'Decolonial Spatial Mapping',
      'Senian Multidimensional Poverty Index (H x A)',
      'Usufruct Digital Ledger Verification',
    ],
    variableMeasured: [
      'Karez Channel Length (km)',
      'Flow Rate (L/s)',
      'Headcount Ratio (H)',
      'Average Deprivation Intensity (A)',
      'Multidimensional Poverty Index (MPI)',
      'Usufruct Rights Verification Status',
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://anthropogis.org/api/karez-telemetry',
      },
    ],
  };
}

export function getCombinedJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [getPersonProfessionalSchema(), getDatasetSchema()],
  };
}
```

### 3.2 Proposed `components/JsonLd.tsx`
```tsx
import { getCombinedJsonLd } from '@/lib/json-ld';

export function JsonLd() {
  const jsonLd = getCombinedJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}
```

### 3.3 Proposed `app/layout.tsx` Integration
```tsx
import { JsonLd } from '@/components/JsonLd';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`}>
      <body className="...">
        <JsonLd />
        ...
        {children}
      </body>
    </html>
  );
}
```

---

## 4. Caveats

1. **Domain Base URL**: `https://anthropogis.org` is used as the canonical URL base. In production, this can optionally be wired to an environment variable (`process.env.NEXT_PUBLIC_SITE_URL || 'https://anthropogis.org'`).
2. **Read-Only Scope**: This report provides verified blueprints and designs. Code creation of `lib/json-ld.ts`, `components/JsonLd.tsx`, and modification of `app/layout.tsx` will be executed by Implementer agents.

---

## 5. Conclusion

- The proposed single `@graph` JSON-LD schema design satisfies all requirements for **Person / ProfessionalService** and **Dataset / Project** schema types.
- The layout remains completely clean by delegating schema generation to `lib/json-ld.ts` and script embedding to `<JsonLd />`.
- Escaping HTML special characters via `.replace(/</g, '\\u003c')` guarantees XSS-safe Next.js App Router script rendering.

---

## 6. Verification Method

To independently verify the implementation:

1. **Static Analysis & Build Verification**:
   - Check that `lib/json-ld.ts` exports `getCombinedJsonLd()`, `getPersonProfessionalSchema()`, and `getDatasetSchema()`.
   - Run standard TypeScript / Next.js build check (`npm run build` or `npx tsc --noEmit`).
2. **DOM / HTML Inspection**:
   - Run the application (`npm run dev` or `npm start`).
   - View rendered HTML page source (`curl http://localhost:3000` or browser View Source).
   - Confirm `<script type="application/ld+json">` exists in the rendered HTML payload.
3. **JSON & Schema.org Compliance**:
   - Extract the JSON payload inside the `<script type="application/ld+json">` tag.
   - Run `JSON.parse()` to ensure 100% valid syntax without trailing commas or syntax errors.
   - Validate structure using the [Schema.org Validator](https://validator.schema.org/) or Google Rich Results Test.
