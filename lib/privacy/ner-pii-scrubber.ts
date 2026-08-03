/**
 * Client-side Named Entity Recognition (NER) & PII Anonymization Scrubber
 * Complies with World Bank ESS5/ESS10 directives & Pakistan Data Privacy Standards.
 * Redacts person names, CNIC identity numbers, email addresses, phone numbers,
 * and fuzzes GPS coordinates to 2 decimal places (~1.1km grid protection).
 */

export interface PiiScrubAuditResult {
  piiDetected: boolean;
  scrubbedFields: string[];
  redactedCount: number;
}

// Regex Patterns
const CNIC_REGEX = /\b\d{5}[-\s]?\d{7}[-\s]?\d\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Mobile numbers allow a separator at EACH digit-group boundary (0-333-445-6677
// style 3-3-4 grouping), not just one — manual entry commonly spaces or
// dashes every group ("0333 445 6677", "+92 300 123 4567"), which the
// previous single-separator pattern missed while still catching the compact
// form ("03001234567"). Landline pattern is unchanged.
const PHONE_REGEX = /(?:\+92[-\s]?|0)3\d{2}[-\s]?\d{3}[-\s]?\d{4}\b|\b0\d{2,4}[-\s]?\d{6,8}\b/g;

// Honorifics & regional naming prefixes common in Balochistan & Pakistan
const NAME_TITLES_REGEX = /\b(Malik|Khan|Bibi|Syed|Sardar|Mir|Jam|Rind|Bugti|Marri|Mengal|Raisani|Zehri|Zarakzai|Son of|W\/O|D\/O|S\/O|Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi;
// Same honorifics as a SUFFIX (e.g. "Nazneen Bibi") — Baloch usage often
// places Bibi/Khan/Baig after the given name rather than before it, which the
// prefix-only pattern above missed entirely.
const NAME_SUFFIX_REGEX = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(Bibi|Khan|Baig)\b/g;
const SPECIFIC_NAME_LABELS_REGEX = /(?:respondent_name|beneficiary|full_name|person_name|contact_person|name)\s*[:=]\s*([A-Za-z\s]{2,40})/gi;

// Object keys that unambiguously hold a person's name — the whole value is PII
// and must be redacted outright. Deliberately excludes bare/ambiguous "name"
// keys (districtName, siteName, indicator name) so place/label names survive.
const PERSON_NAME_KEY = /(full_?name|person_?name|respondent_?name|contact_?person|beneficiary_?name|applicant_?name|complainant_?name|owner_?name|guardian_?name|father_?name|next_of_kin)/;

/**
 * Computes a lightweight deterministic hash for CNICs to retain matching capability without exposing 13-digit raw identity.
 */
export function hashCnic(cnicRaw: string): string {
  const clean = cnicRaw.replace(/[^0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `CNIC_HASH_${hexHash.slice(0, 12)}`;
}

/**
 * Redacts CNIC numbers matching format \d{5}-\d{7}-\d{1} or unformatted 13 digits.
 */
export function redactCNIC(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text.replace(CNIC_REGEX, (match) => hashCnic(match));
}

/**
 * Redacts person names based on regional honorifics, titles, and name field patterns.
 */
export function redactNames(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let scrubbed = text;
  
  // Replace labeled names (e.g. Respondent Name: Gul Khan)
  scrubbed = scrubbed.replace(SPECIFIC_NAME_LABELS_REGEX, (full, name) => {
    const trimmed = name.trim();
    if (trimmed.length > 1) {
      return full.replace(trimmed, '[REDACTED_PERSON]');
    }
    return full;
  });

  // Replace title-based names (e.g. Malik Gul Khan -> [REDACTED_PERSON])
  scrubbed = scrubbed.replace(NAME_TITLES_REGEX, '[REDACTED_PERSON]');

  // Replace suffix-honorific names (e.g. Nazneen Bibi -> [REDACTED_PERSON])
  scrubbed = scrubbed.replace(NAME_SUFFIX_REGEX, '[REDACTED_PERSON]');

  // KNOWN, DOCUMENTED GAP: a bare name with no honorific at all (e.g. "Nazeer
  // Ahmed and his neighbor confirmed...") is NOT caught by this or any regex
  // above. Reliably detecting person names in free prose needs a trained NER
  // model — a name/place gazetteer or capitalized-word-pair regex would flag
  // too many district/site/organization names as false positives to be safe
  // to auto-redact. See scripts/verify-pii-scrubber.mjs for the exact
  // regression cases this function does and does not currently catch.
  return scrubbed;
}

/**
 * Redacts email addresses and phone numbers.
 */
export function redactContactInfo(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let scrubbed = text.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
  scrubbed = scrubbed.replace(PHONE_REGEX, '[REDACTED_PHONE]');
  return scrubbed;
}

/**
 * Fuzzes GPS coordinates by rounding latitude and longitude to 2 decimal places (~1.1km radius protection).
 */
export function fuzzCoordinates(lat: number, lon: number): { lat: number; lon: number } {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    return { lat, lon };
  }
  return {
    lat: Math.round(lat * 100) / 100,
    lon: Math.round(lon * 100) / 100,
  };
}

/**
 * Fuzzes KoboToolbox / GIS spatial strings (geopoint "lat lon alt acc", geotrace, geoshape).
 */
export function fuzzGeoString(geoStr: string): string {
  if (!geoStr || typeof geoStr !== 'string') return geoStr;

  // Handle delimiter separated strings (semicolons for geotrace/geoshape)
  if (geoStr.includes(';')) {
    return geoStr
      .split(';')
      .map((pt) => fuzzGeoString(pt.trim()))
      .join('; ');
  }

  const tokens = geoStr.trim().split(/\s+/);
  if (tokens.length >= 2) {
    const lat = parseFloat(tokens[0]);
    const lon = parseFloat(tokens[1]);
    if (!isNaN(lat) && !isNaN(lon)) {
      const fLat = (Math.round(lat * 100) / 100).toFixed(2);
      const fLon = (Math.round(lon * 100) / 100).toFixed(2);
      tokens[0] = fLat;
      tokens[1] = fLon;
      return tokens.join(' ');
    }
  }

  return geoStr;
}

/**
 * Recursively fuzzes GeoJSON `coordinates` arrays — Point [lon,lat],
 * LineString/MultiPoint [[lon,lat],...], Polygon/MultiLineString and
 * MultiPolygon (deeper nesting) — by rounding each position's lon/lat to 2
 * decimal places (~1.1km grid). Elevation (3rd element) is preserved.
 * scrubPayload previously only fuzzed scalar lat/lon object props, so any PII
 * serialized as GeoJSON kept full-precision coordinates.
 */
export function fuzzGeoJSONCoordinates(coords: any): any {
  if (!Array.isArray(coords)) return coords;
  // A GeoJSON position is an array whose elements are numbers: [lon, lat, alt?].
  if (typeof coords[0] === 'number') {
    return coords.map((n, i) => (i < 2 && typeof n === 'number' ? Math.round(n * 100) / 100 : n));
  }
  // Otherwise it's an array of positions / rings — recurse.
  return coords.map((c) => fuzzGeoJSONCoordinates(c));
}

/**
 * Comprehensive PII Scrubber function that recursively sanitizes any object or primitive.
 */
export function scrubPayload<T>(payload: T): T {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload === 'string') {
    let text = payload as string;
    text = redactCNIC(text);
    text = redactNames(text);
    text = redactContactInfo(text);
    return text as unknown as T;
  }

  if (typeof payload === 'number' || typeof payload === 'boolean') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => scrubPayload(item)) as unknown as T;
  }

  if (typeof payload === 'object') {
    const scrubbedObj: Record<string, any> = {};

    const rawObj = payload as Record<string, any>;

    // Process every key with one unified, key-aware ruleset. Coordinate fuzzing
    // is handled inline here. (Previously a separate `hasLat && hasLon`
    // early-return path applied only value-level scrubbing to the other keys,
    // so any object carrying lat/lon — e.g. every field-log payload — bypassed
    // the person-name/CNIC/contact redaction below.)
    for (const [key, val] of Object.entries(rawObj)) {
      const lowerKey = key.toLowerCase();

      // Fuzz GPS coordinates to ~2 decimal places (~1.1km grid protection).
      if ((lowerKey === 'lat' || lowerKey === 'latitude') && typeof val === 'number') {
        scrubbedObj[key] = Math.round(val * 100) / 100;
      } else if ((lowerKey === 'lon' || lowerKey === 'lng' || lowerKey === 'longitude') && typeof val === 'number') {
        scrubbedObj[key] = Math.round(val * 100) / 100;
      } else if (lowerKey === 'coordinates' && Array.isArray(val)) {
        scrubbedObj[key] = fuzzGeoJSONCoordinates(val);
      } else if (lowerKey.includes('cnic') && typeof val === 'string') {
        scrubbedObj[key] = redactCNIC(val);
      } else if ((lowerKey.includes('beneficiary') || lowerKey.includes('respondent')) && typeof val === 'string') {
        // Fields that always denote a person → redact the entire value.
        // (Previously this branch had `hashCnic(val).startsWith('CNIC_HASH_') ? val : ...`
        // which is ALWAYS true, so the raw name was returned unredacted — a PII leak.)
        scrubbedObj[key] = val.trim() ? '[REDACTED_PERSON]' : val;
      } else if (lowerKey.includes('name') && typeof val === 'string') {
        // "name" is ambiguous. Redact declared person-name keys entirely, but for
        // place/label names (districtName, siteName, indicator name) only strip
        // embedded honorific/labeled person names so the place label survives.
        scrubbedObj[key] = PERSON_NAME_KEY.test(lowerKey)
          ? (val.trim() ? '[REDACTED_PERSON]' : val)
          : redactNames(val);
      } else if ((lowerKey === 'geopoint' || lowerKey === 'geotrace' || lowerKey === 'geoshape') && typeof val === 'string') {
        scrubbedObj[key] = fuzzGeoString(val);
      } else if ((lowerKey.includes('email') || lowerKey.includes('phone') || lowerKey.includes('contact')) && typeof val === 'string') {
        scrubbedObj[key] = redactContactInfo(val);
      } else {
        scrubbedObj[key] = scrubPayload(val);
      }
    }

    return scrubbedObj as T;
  }

  return payload;
}

/**
 * Tests a pattern WITHOUT mutating shared regex state. The module-level PII
 * regexes carry the /g flag (needed by .replace()), and calling .test() on a
 * global regex advances its lastIndex — so reusing them here made getScrubAudit
 * intermittently miss matches depending on prior calls. A fresh non-global
 * clone is stateless, so detection is deterministic.
 */
function patternPresent(re: RegExp, str: string): boolean {
  return new RegExp(re.source, re.flags.replace('g', '')).test(str);
}

/**
 * Returns an audit assessment of PII detection & scrubbing on a payload.
 */
export function getScrubAudit(payload: Record<string, any>): PiiScrubAuditResult {
  const scrubbedFields: string[] = [];
  let redactedCount = 0;

  const jsonStr = JSON.stringify(payload);

  if (patternPresent(CNIC_REGEX, jsonStr)) {
    scrubbedFields.push('CNIC_NUMBER');
    redactedCount++;
  }
  if (patternPresent(EMAIL_REGEX, jsonStr)) {
    scrubbedFields.push('EMAIL_ADDRESS');
    redactedCount++;
  }
  if (patternPresent(PHONE_REGEX, jsonStr)) {
    scrubbedFields.push('TELEPHONE_NUMBER');
    redactedCount++;
  }
  if (
    patternPresent(NAME_TITLES_REGEX, jsonStr) ||
    patternPresent(NAME_SUFFIX_REGEX, jsonStr) ||
    patternPresent(SPECIFIC_NAME_LABELS_REGEX, jsonStr)
  ) {
    scrubbedFields.push('PERSON_NAME');
    redactedCount++;
  }

  return {
    piiDetected: scrubbedFields.length > 0,
    scrubbedFields,
    redactedCount,
  };
}
