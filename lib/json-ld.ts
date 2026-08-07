export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://anthropologyportfolio.vercel.app';

export interface PersonSchema {
  '@type': string;
  '@id': string;
  name: string;
  jobTitle: string;
  description: string;
  knowAbout: string[];
  areaServed: string;
  url: string;
}

export interface ProfessionalServiceSchema {
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  url: string;
  areaServed: string;
  knowAbout: string[];
  provider?: {
    '@type': string;
    name: string;
  };
  offerCatalog: {
    '@type': string;
    name: string;
    itemListElement: Array<{
      '@type': string;
      item: {
        '@type': string;
        name: string;
        description: string;
      };
    }>;
  };
}

export interface DatasetSchema {
  '@type': string | string[];
  '@id': string;
  name: string;
  description: string;
  url: string;
  spatialCoverage: {
    '@type': string;
    name: string;
    geo?: {
      '@type': string;
      box?: string;
    };
  };
  variableMeasured: string[];
  provider: {
    '@type': string;
    name: string;
    url: string;
  };
}

export interface WebSiteSchema {
  '@type': string;
  '@id': string;
  name: string;
  url: string;
  description: string;
  publisher?: {
    '@type': string;
    name: string;
  };
}

export function generatePersonSchema(siteUrl: string = SITE_URL): PersonSchema {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}/#programme`,
    name: 'IFRAP Component 3 Programme (FPMU / PIU)',
    jobTitle: 'Implementation, Safeguards & M&E Unit',
    description:
      'Provincial implementation unit operating the MIRAB platform for World Bank IFRAP Component 3 — Balochistan water governance, ESF safeguards, and monitoring & evaluation.',
    url: siteUrl,
    areaServed: 'Balochistan, Pakistan',
    knowAbout: [
      'Water Governance',
      'WebGIS',
      'M&E Telemetry',
      'Senian MPI',
      'Customary Usufruct Rights',
      'Indigenous Technical Knowledge',
      'Grievance Redress Mechanism',
    ],
  };
}

export function generateProfessionalServiceSchema(siteUrl: string = SITE_URL): ProfessionalServiceSchema {
  return {
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/#service`,
    name: 'MIRAB — IFRAP Component 3 Platform',
    description:
      'Monitoring, governance and safeguards platform for World Bank IFRAP Component 3 (Balochistan water governance): field ethnography, Grievance Redress, customary usufruct certificates, decolonial WebGIS, ESF safeguard telemetry, and Senian MPI M&E.',
    url: siteUrl,
    areaServed: 'Balochistan, Pakistan',
    knowAbout: [
      'Water Governance',
      'Decolonial WebGIS',
      'Senian MPI Analytics',
      'Customary Usufruct Rights',
      'M&E Telemetry',
    ],
    provider: {
      '@type': 'Organization',
      name: 'IFRAP Component 3 Programme (FPMU / PIU)',
    },
    offerCatalog: {
      '@type': 'OfferCatalog',
      name: 'IFRAP Component 3 Platform Modules',
      itemListElement: [
        {
          '@type': 'OfferCatalogItem',
          item: {
            '@type': 'Service',
            name: 'Decolonial WebGIS & Spatial Analysis',
            description:
              'Interactive cartographic mapping of indigenous Karez water systems and decolonial ITK spatial layers.',
          },
        },
        {
          '@type': 'OfferCatalogItem',
          item: {
            '@type': 'Service',
            name: 'Senian MPI & M&E Telemetry Dashboard',
            description:
              'Quantitative evaluation of capability deprivations and real-time Monitoring & Evaluation telemetry for water infrastructure.',
          },
        },
        {
          '@type': 'OfferCatalogItem',
          item: {
            '@type': 'Service',
            name: 'Customary Usufruct Rights & Fiduciary Shield',
            description:
              'Customary land rights verification, digital ledger audit trails, and fiduciary governance certificates.',
          },
        },
      ],
    },
  };
}

export function generateDatasetSchema(siteUrl: string = SITE_URL): DatasetSchema {
  return {
    '@type': ['Dataset', 'Project'],
    '@id': `${siteUrl}/#dataset`,
    name: 'MIRAB — Balochistan Karez WebGIS & M&E Telemetry (IFRAP Component 3)',
    description:
      'Integrated spatial dataset, Senian MPI capability metrics, and customary usufruct rights telemetry for water resource management in Balochistan.',
    url: `${siteUrl}/telemetry`,
    spatialCoverage: {
      '@type': 'Place',
      name: 'Balochistan, Pakistan',
      geo: {
        '@type': 'GeoShape',
        box: '24.89 60.87 32.06 70.25',
      },
    },
    variableMeasured: [
      'Senian Multidimensional Poverty Index',
      'Capability Deprivation Index',
      'Karez Water Discharge Rate',
      'Usufruct Right Certificate Registrations',
      'Indigenous Technical Knowledge Layers',
    ],
    provider: {
      '@type': 'Organization',
      name: 'IFRAP Component 3 Programme (FPMU / PIU)',
      url: siteUrl,
    },
  };
}

export function generateWebSiteSchema(siteUrl: string = SITE_URL): WebSiteSchema {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'MIRAB — IFRAP Component 3 Platform',
    url: siteUrl,
    description:
      'Official platform for World Bank IFRAP Component 3 (Balochistan water governance): decolonial WebGIS, Senian MPI M&E telemetry, Grievance Redress, and a customary-usufruct fiduciary ledger.',
    publisher: {
      '@type': 'Organization',
      name: 'IFRAP Component 3 Programme (FPMU / PIU)',
    },
  };
}

export function getJsonLd(siteUrl: string = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateProfessionalServiceSchema(siteUrl),
      generatePersonSchema(siteUrl),
      generateDatasetSchema(siteUrl),
      generateWebSiteSchema(siteUrl),
    ],
  };
}
