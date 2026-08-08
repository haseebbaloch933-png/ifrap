import React from 'react';
import type { Metadata } from 'next';
import { GisImpactMapperLazy } from '@/components/gis-impact/GisImpactMapperLazy';

export const metadata: Metadata = {
  title: 'GIS Impact Mapper | World Bank IFRAP Programme',
  description: 'Interactive WebGIS spatial impact mapper layering 2022 flood extents, Karez buffers, civil works reconstruction, land usufruct rights, and ESF risk hotspots.',
};

export default function GisImpactPage() {
  return <GisImpactMapperLazy />;
}
