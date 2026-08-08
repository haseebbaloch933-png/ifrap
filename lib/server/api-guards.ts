/**
 * Shared guards for mutating API routes (T-03): per-actor rate limiting and
 * request-body size caps, so a single client can't flood a route or push an
 * unbounded payload into the store.
 *
 * SCOPE / LIMITATION: the rate-limit counters live in this process's memory,
 * so limits are enforced PER RUNNING INSTANCE (the same trade-off as the file
 * store — see lib/server/file-store.ts). That is correct for the single-
 * instance dev/pilot deployment; a multi-instance production deployment should
 * back this with a shared store (Redis or a Postgres counter) so the limit is
 * global. The API surface here stays the same when that swap happens.
 */
import { NextResponse } from 'next/server';

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const WINDOW_MS = envInt('RATE_LIMIT_WINDOW_MS', 60_000);
/** Optional global override; when unset each route uses its own default limit. */
const GLOBAL_MAX = process.env.RATE_LIMIT_MAX ? envInt('RATE_LIMIT_MAX', 0) : null;

interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 20_000;

/** Fixed-window counter. Returns whether the call is allowed + retry hint. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = WINDOW_MS
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }

  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;

  if (b.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  return { ok: true, remaining: Math.max(0, limit - b.count), retryAfterSec: 0 };
}

/** Best-effort client IP for unauthenticated/fallback keying. */
function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/** Stable rate-limit key: prefer the verified actor id, fall back to IP. */
export function actorKey(actorId: string | null | undefined, req: Request, route: string): string {
  const who = actorId && actorId.trim() ? actorId.trim().toLowerCase() : `ip:${clientIp(req)}`;
  return `${route}::${who}`;
}

/** Typed error so callers can map to the right HTTP status. */
export class RequestGuardError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'RequestGuardError';
  }
}

/** Parse a JSON body while enforcing a hard byte cap (Content-Length + actual). */
export async function readJsonLimited(req: Request, maxBytes: number): Promise<any> {
  const declared = req.headers.get('content-length');
  if (declared && Number(declared) > maxBytes) {
    throw new RequestGuardError(413, 'Request body too large');
  }
  const text = await req.text();
  if (Buffer.byteLength(text, 'utf8') > maxBytes) {
    throw new RequestGuardError(413, 'Request body too large');
  }
  if (!text.trim()) {
    throw new RequestGuardError(400, 'Request body required');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new RequestGuardError(400, 'Invalid JSON body');
  }
}

export interface GuardOptions {
  actorId: string | null | undefined;
  route: string;
  /** Max requests per actor per window (before GLOBAL_MAX override). */
  limit: number;
  /** Max request body size in bytes. */
  maxBytes: number;
}

/**
 * One-call guard for a mutating handler: rate-limit the actor, then read and
 * size-cap the JSON body. Rate limiting runs first so oversized/garbage bodies
 * still count against the limit. Returns either the parsed body or a ready-to-
 * return error response.
 */
export async function guardMutation(
  req: Request,
  opts: GuardOptions
): Promise<{ ok: true; body: any } | { ok: false; response: NextResponse }> {
  const limit = GLOBAL_MAX ?? opts.limit;
  const rl = checkRateLimit(actorKey(opts.actorId, req, opts.route), limit);
  if (!rl.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      ),
    };
  }
  try {
    const body = await readJsonLimited(req, opts.maxBytes);
    return { ok: true, body };
  } catch (err) {
    if (err instanceof RequestGuardError) {
      return { ok: false, response: NextResponse.json({ error: err.message }, { status: err.status }) };
    }
    return { ok: false, response: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) };
  }
}

/** Trim a string field to a maximum length (defense-in-depth on stored size). */
export function capString(value: unknown, max: number): string {
  return String(value ?? '').slice(0, max);
}

/** Per-route body-size caps (bytes). Field logs carry longer narratives + geo. */
export const BODY_LIMITS = {
  agent: envInt('MAX_BODY_BYTES_AGENT', 16 * 1024),
  grm: envInt('MAX_BODY_BYTES_GRM', 32 * 1024),
  fieldLogs: envInt('MAX_BODY_BYTES_FIELD_LOGS', 256 * 1024),
  fiduciary: envInt('MAX_BODY_BYTES_FIDUCIARY', 16 * 1024),
} as const;

/** Per-route request rate limits (requests per window, default 60s). */
export const RATE_LIMITS = {
  agent: envInt('RATE_LIMIT_AGENT', 20),
  grm: envInt('RATE_LIMIT_GRM', 30),
  fieldLogs: envInt('RATE_LIMIT_FIELD_LOGS', 40),
  fiduciary: envInt('RATE_LIMIT_FIDUCIARY', 20),
} as const;
