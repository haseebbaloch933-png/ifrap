import React from 'react';
import type { Metadata } from 'next';
import { MeResultsEngine } from '@/components/me-results/MeResultsEngine';

export const metadata: Metadata = {
  title: 'M&E Results Engine | World Bank IFRAP Programme',
  description: 'Monitoring & Evaluation Engine: Senian MPI capability reduction metrics, programme target indicator tracking, budget burn rates, and PDF/CSV report export.',
};

export default function MeResultsPage() {
  return <MeResultsEngine />;
}
