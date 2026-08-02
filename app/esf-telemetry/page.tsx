import React from 'react';
import type { Metadata } from 'next';
import { EsfTelemetryPortal } from '@/components/esf/EsfTelemetryPortal';

export const metadata: Metadata = {
  title: 'ESF Telemetry Portal | World Bank IFRAP Component 3',
  description: 'World Bank Environmental and Social Framework (ESS1-ESS10) compliance matrix, live risk indicators, and audit logs.',
};

export default function EsfTelemetryPage() {
  return <EsfTelemetryPortal />;
}
