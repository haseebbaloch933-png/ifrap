import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { IFRAP_DISTRICTS, getIFRAPSummaryStats } from '@/lib/ifrap-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('districtId');

  // If a specific district is requested, return it along with summary stats
  if (districtId) {
    const district = IFRAP_DISTRICTS.find(d => d.id === districtId);
    if (district) {
      return NextResponse.json({
        district,
        summaryStats: getIFRAPSummaryStats(),
      });
    }
    return NextResponse.json({ error: 'District not found' }, { status: 404 });
  }

  // Otherwise, return all districts and summary stats
  return NextResponse.json({
    districts: IFRAP_DISTRICTS,
    summaryStats: getIFRAPSummaryStats(),
  });
}
