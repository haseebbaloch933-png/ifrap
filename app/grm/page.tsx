import React from 'react';
import type { Metadata } from 'next';
import { GrmTicketingCenter } from '@/components/grm/GrmTicketingCenter';

export const metadata: Metadata = {
  title: 'GRM Ticketing Center | World Bank IFRAP Component 3',
  description: 'World Bank IFRAP Component 3 Grievance Redressal Mechanism (GRM) ticket tracking, ESS10 72-hour SLA monitoring, and resolution workflow.',
};

export default function GRMPage() {
  return <GrmTicketingCenter />;
}
