import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { IFRAP_DISTRICTS } from '@/lib/ifrap-data';
import { getLocationsGeoJSON, getRoutesGeoJSON } from '@/lib/map-data';
import { sanitizeQueryParam, validateFilePath } from '@/lib/firebase-sim';
import { getAll } from '@/lib/server/store';
import { FIDUCIARY_COLLECTION, USUFRUCT_SEED, type UsufructCertRecord } from '@/lib/fiduciary-ledger';
import { recordAudit, actorFromToken, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { sealFields, openFields } from '@/lib/server/field-crypto';
import {
  MOCK_ME_ANALYTICS,
  MOCK_DISPLACED_HOUSEHOLDS,
  MOCK_COMPENSATION_BUDGET,
  MOCK_GRM_TICKETS,
} from '@/lib/me-analytics';

// The usufruct ledger read + audit chain require the Node runtime (not Edge).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROUTE = '/api/export';

// Beneficiary/clan identity is sealed at rest (see app/api/fiduciary/route.ts);
// this export must open the same fields or it leaks ciphertext to the caller.
const FIDUCIARY_SENSITIVE: (keyof UsufructCertRecord)[] = ['beneficiary', 'clan'];

// Bulk export is restricted to elevated roles. This is ALSO enforced at the
// edge (proxy.ts matcher + PROTECTED_ROUTES: PROVINCIAL_PIU/FPMU_DIRECTOR), but
// we re-check in-handler so the route is never reachable without a valid,
// sufficiently-privileged session even if the edge matcher and PROTECTED_ROUTES
// ever drift (they have before — see the note in proxy.ts). Defense in depth,
// matching every other sensitive route.
const ELEVATED = ['PROVINCIAL_PIU', 'FPMU_DIRECTOR'];

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.role || !ELEVATED.includes(String(token.role))) {
    await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'GET', route: ROUTE, action: 'DENIED', status: 403 });
    return NextResponse.json({ error: 'Forbidden: elevated privileges required' }, { status: 403 });
  }

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

  // Record the export against the tamper-evident audit chain (ESS10): a bulk
  // export of programme data is exactly what an access log must capture.
  await recordAudit({
    actor: actorFromToken(token),
    method: 'GET',
    route: ROUTE,
    action: 'EXPORT',
    status: 200,
    target: sanitizedType,
  });

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
    // Read the SAME durable ledger the issuance/list route writes and serves
    // (persistence seam), so the export matches the fiduciary screen — not the
    // orphaned in-memory store this route used to read (always empty).
    const stored = await getAll<UsufructCertRecord>(
      FIDUCIARY_COLLECTION,
      USUFRUCT_SEED.map((c) => sealFields(c, FIDUCIARY_SENSITIVE))
    );
    const certificates = stored.map((c) => openFields(c, FIDUCIARY_SENSITIVE));

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
