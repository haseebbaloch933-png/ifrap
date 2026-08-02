import React from 'react';
import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin Dashboard | IFRAP Component 3',
  description: 'FPMU Director Admin Dashboard for World Bank IFRAP Component 3.',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'FPMU_DIRECTOR') {
    redirect('/telemetry');
  }

  return <AdminDashboard />;
}
