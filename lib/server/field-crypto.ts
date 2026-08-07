/**
 * Field-level encryption at rest (server-only) — AES-256-GCM.
 *
 * Encrypts the SENSITIVE fields of a record (grievance narratives/names,
 * usufruct beneficiary identity, field-log payloads) before they are persisted,
 * while leaving operational fields (id, district, status, timestamps) in clear
 * so the app can still filter, count, and order without decrypting everything.
 * This is the "encryption of grievance/tenure data at rest" control: an infra
 * operator or a raw DB/file dump reveals only ciphertext for the protected
 * fields.
 *
 * Key management, env-gated like the Postgres and OIDC switches:
 *   - DATA_ENCRYPTION_KEY set  → 32-byte base64 key; sensitive fields are sealed.
 *   - DATA_ENCRYPTION_KEY unset → passthrough (dev default): values stored as-is.
 * Generate a key:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * The envelope is a self-describing string ("enc:v1:iv.tag.ct", base64 parts),
 * so a sealed value slots into the same string slot, seal/open are idempotent,
 * and plaintext (dev) or already-sealed values are handled safely. Values are
 * JSON-encoded before sealing, so both strings and objects round-trip.
 *
 * NOTE (production): the key MUST be supplied from a secrets manager and backed
 * up — losing it makes sealed data unrecoverable (that is the point). Key
 * rotation (re-encrypting under a new key) is a documented follow-up.
 */
import crypto from 'crypto';

const PREFIX = 'enc:v1:';
const ALGO = 'aes-256-gcm';

// Cache the parsed key against the raw env value so a changed env (e.g. tests
// toggling it) is picked up, without re-parsing on every call.
let cache: { raw: string | undefined; key: Buffer | null } | null = null;

function getKey(): Buffer | null {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (cache && cache.raw === raw) return cache.key;
  let key: Buffer | null = null;
  if (raw) {
    const buf = Buffer.from(raw, 'base64');
    if (buf.length !== 32) {
      throw new Error(
        'DATA_ENCRYPTION_KEY must be a 32-byte base64 string (AES-256). Generate: ' +
          'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
      );
    }
    key = buf;
  }
  cache = { raw, key };
  return key;
}

/** True when a key is configured (encryption active). */
export function isEncryptionEnabled(): boolean {
  return getKey() !== null;
}

/** True when a value is a sealed envelope string. */
export function isSealed(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/** Encrypt any JSON-serializable value into an envelope string (passthrough if disabled). */
export function sealValue(value: unknown): unknown {
  const key = getKey();
  if (key === null) return value; // encryption disabled (dev)
  if (value === undefined || value === null) return value;
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}.${tag.toString('base64')}.${ct.toString('base64')}`;
}

/** Decrypt an envelope string back to its value; returns non-sealed input unchanged. */
export function openValue(value: unknown): unknown {
  if (!isSealed(value)) return value; // plaintext (dev) or already open
  const key = getKey();
  if (key === null) {
    // Sealed data but no key — refuse to guess/leak. Fail loud.
    throw new Error('Encountered encrypted data at rest but DATA_ENCRYPTION_KEY is not set.');
  }
  const [ivB64, tagB64, ctB64] = (value as string).slice(PREFIX.length).split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag); // throws on tampered ciphertext (GCM auth)
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

/** Return a shallow copy of `record` with the named fields sealed. */
export function sealFields<T extends Record<string, any>>(record: T, fields: (keyof T)[]): T {
  const out: any = { ...record };
  for (const f of fields) {
    if (out[f] !== undefined && out[f] !== null && !isSealed(out[f])) {
      out[f] = sealValue(out[f]);
    }
  }
  return out;
}

/** Return a shallow copy of `record` with the named fields opened (decrypted). */
export function openFields<T extends Record<string, any>>(record: T, fields: (keyof T)[]): T {
  const out: any = { ...record };
  for (const f of fields) {
    if (isSealed(out[f])) out[f] = openValue(out[f]);
  }
  return out;
}
