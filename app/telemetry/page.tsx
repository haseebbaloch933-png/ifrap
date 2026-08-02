import React from 'react';
import type { Metadata } from 'next';
import { TelemetryDashboard } from '@/components/TelemetryDashboard';
import { generateDatasetSchema, SITE_URL } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'M&E Telemetry Dashboard | Senian MPI Analytics & Balochistan IFRAP',
  description:
    'Real-time Monitoring & Evaluation telemetry dashboard evaluating Senian Multidimensional Poverty Index (MPI = H x A) and capability deprivations across Balochistan IFRAP Component 3 water infrastructure.',
  keywords: [
    'M&E Telemetry',
    'Senian MPI',
    'Multidimensional Poverty Index',
    'Balochistan IFRAP',
    'Capability Approach',
    'Water Management Telemetry',
    'Karez Rehabilitation',
    'Applied Anthropology'
  ],
  openGraph: {
    title: 'M&E Telemetry Dashboard | Senian MPI Analytics',
    description: 'Real-time Senian Multidimensional Poverty Index & IFRAP Component 3 Telemetry Engine',
    type: 'website',
    url: `${SITE_URL}/telemetry`,
  },
};

export default function TelemetryPage() {
  const datasetSchema = {
    '@context': 'https://schema.org',
    ...generateDatasetSchema(SITE_URL),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <TelemetryDashboard />
    </>
  );
}

