import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { IFRAP_DISTRICTS } from '@/lib/ifrap-data';
import { getLocationsGeoJSON, getRoutesGeoJSON } from '@/lib/map-data';
import { store, sanitizeQueryParam, validateFilePath } from '@/lib/firebase-sim';
import {
  MOCK_ME_ANALYTICS,
  MOCK_DISPLACED_HOUSEHOLDS,
  MOCK_COMPENSATION_BUDGET,
  MOCK_GRM_TICKETS,
} from '@/lib/me-analytics';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get('type') || '';
  const sanitizedType = sanitizeQueryParam(rawType).toLowerCase().trim();

  // Validate filename or type parameter against path traversal attacks
  const fileCheck = validateFilePath(rawType);
  if (!fileCheck.valid) {
    return NextResponse.json({ error: 'PATH_TRAVERSAL_DETECTED' }, { status: 400 });
  }

  const supportedTypes = ['telemetry', 'karez', 'usufruct', 'me_analytics', 'me_displaced', 'me_budget', 'me_grm'];
  if (!supportedTypes.includes(sanitizedType)) {
    return NextResponse.json({ error: 'UNSUPPORTED_EXPORT_FORMAT' }, { status: 400 });
  }

  if (sanitizedType === 'telemetry') {
    const header = 'district,province,component,population,karez_count,headcount_ratio,poverty_intensity,mpi\n';
    const rows = IFRAP_DISTRICTS.map(
      (d) =>
        `${d.districtName},${d.province},${d.component},${d.population},${d.karezSystemsCount},${d.headcountRatio},${d.povertyIntensity},${(
          d.headcountRatio * d.povertyIntensity
        ).toFixed(4)}`
    ).join('\n');

    return new NextResponse(header + rows, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ifrap_telemetry_export.csv"',
      },
    });
  }

  if (sanitizedType === 'karez') {
    const geojson = {
      type: 'FeatureCollection',
      features: [...getLocationsGeoJSON().features, ...getRoutesGeoJSON().features],
    };

    return NextResponse.json(geojson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="karez_spatial_data.geojson"',
      },
    });
  }

  if (sanitizedType === 'usufruct') {
    const certificates = Object.entries(store)
      .filter(([key]) => key.startsWith('usufruct_certificates/'))
      .map(([key, value]) => ({ id: key.replace('usufruct_certificates/', ''), ...value }));

    return NextResponse.json(
      { certs: certificates, count: certificates.length },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="usufruct_ledger_certificates.json"',
        },
      }
    );
  }

  if (sanitizedType === 'me_analytics') {
    return NextResponse.json(MOCK_ME_ANALYTICS, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="me_analytics_summary.json"',
      },
    });
  }

  if (sanitizedType === 'me_displaced') {
    return NextResponse.json(MOCK_DISPLACED_HOUSEHOLDS, { status: 200 });
  }

  if (sanitizedType === 'me_budget') {
    return NextResponse.json(MOCK_COMPENSATION_BUDGET, { status: 200 });
  }

  if (sanitizedType === 'me_grm') {
    return NextResponse.json(MOCK_GRM_TICKETS, { status: 200 });
  }

  return NextResponse.json({ error: 'UNSUPPORTED_EXPORT_FORMAT' }, { status: 400 });
}

