import React from 'react';
import type { Metadata } from 'next';
import { FieldAnthropologistLog } from '@/components/field-log/FieldAnthropologistLog';

export const metadata: Metadata = {
  title: 'Field Anthropologist Log | World Bank IFRAP Programme',
  description: 'Ethnographic field narrative logging with offline IndexedDB draft save, client-side NER PII scrubbing, and evidence-tagging for later retrieval.',
};

export default function FieldLogPage() {
  return <FieldAnthropologistLog />;
}
