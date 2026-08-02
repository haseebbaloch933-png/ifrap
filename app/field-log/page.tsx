import React from 'react';
import type { Metadata } from 'next';
import { FieldAnthropologistLog } from '@/components/field-log/FieldAnthropologistLog';

export const metadata: Metadata = {
  title: 'Field Anthropologist Log | World Bank IFRAP Component 3',
  description: 'Ethnographic field narrative logging with offline IndexedDB draft save, client-side NER PII scrubbing, and pgvector RAG integration.',
};

export default function FieldLogPage() {
  return <FieldAnthropologistLog />;
}
