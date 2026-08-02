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
const PHONE_REGEX = /(\+92|0)?3\d{2}[-\s]?\d{7}|\b0\d{2,4}[-\s]?\d{6,8}\b/g;

// Honorifics & regional naming prefixes common in Balochistan & Pakistan
const NAME_TITLES_REGEX = /\b(Malik|Khan|Bibi|Syed|Sardar|Mir|Jam|Rind|Bugti|Marri|Mengal|Raisani|Zehri|Zarakzai|Son of|W\/O|D\/O|S\/O|Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi;
const SPECIFIC_NAME_LABELS_REGEX = /(?:respondent_name|beneficiary|full_name|person_name|contact_person|name)\s*[:=]\s*([A-Za-z\s]{2,40})/gi;

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

    // Specific object coordinate property fuzzing
    const rawObj = payload as Record<string, any>;
    
    // Check lat / lon properties directly
    let hasLat = false;
    let hasLon = false;
    let latVal = 0;
    let lonVal = 0;

    for (const key of Object.keys(rawObj)) {
      const lowerKey = key.toLowerCase();
      const val = rawObj[key];

      if ((lowerKey === 'lat' || lowerKey === 'latitude') && typeof val === 'number') {
        hasLat = true;
        latVal = val;
      } else if ((lowerKey === 'lon' || lowerKey === 'lng' || lowerKey === 'longitude') && typeof val === 'number') {
        hasLon = true;
        lonVal = val;
      }
    }

    if (hasLat && hasLon) {
      const f = fuzzCoordinates(latVal, lonVal);
      for (const key of Object.keys(rawObj)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'lat' || lowerKey === 'latitude') {
          scrubbedObj[key] = f.lat;
        } else if (lowerKey === 'lon' || lowerKey === 'lng' || lowerKey === 'longitude') {
          scrubbedObj[key] = f.lon;
        } else {
          scrubbedObj[key] = scrubPayload(rawObj[key]);
        }
      }
      return scrubbedObj as T;
    }

    // Process all keys
    for (const [key, val] of Object.entries(rawObj)) {
      const lowerKey = key.toLowerCase();
      
      // Known PII fields
      if (lowerKey.includes('cnic') && typeof val === 'string') {
        scrubbedObj[key] = redactCNIC(val);
      } else if ((lowerKey.includes('name') || lowerKey.includes('beneficiary') || lowerKey.includes('respondent')) && typeof val === 'string') {
        scrubbedObj[key] = hashCnic(val).startsWith('CNIC_HASH_') ? val : redactNames(val);
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
 * Returns an audit assessment of PII detection & scrubbing on a payload.
 */
export function getScrubAudit(payload: Record<string, any>): PiiScrubAuditResult {
  const scrubbedFields: string[] = [];
  let redactedCount = 0;

  const jsonStr = JSON.stringify(payload);

  if (CNIC_REGEX.test(jsonStr)) {
    scrubbedFields.push('CNIC_NUMBER');
    redactedCount++;
  }
  if (EMAIL_REGEX.test(jsonStr)) {
    scrubbedFields.push('EMAIL_ADDRESS');
    redactedCount++;
  }
  if (PHONE_REGEX.test(jsonStr)) {
    scrubbedFields.push('TELEPHONE_NUMBER');
    redactedCount++;
  }
  if (NAME_TITLES_REGEX.test(jsonStr) || SPECIFIC_NAME_LABELS_REGEX.test(jsonStr)) {
    scrubbedFields.push('PERSON_NAME');
    redactedCount++;
  }

  return {
    piiDetected: scrubbedFields.length > 0,
    scrubbedFields,
    redactedCount,
  };
}
