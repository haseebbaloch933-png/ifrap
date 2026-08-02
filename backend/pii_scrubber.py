"""
Server-side Python Named Entity Recognition (NER) & PII Scrubbing Fallback Module
Sanitizes incoming KoboToolbox / Express survey payloads before PostGIS database insertion.
"""

import re
import hashlib
import math
from typing import Dict, Any, Tuple, Union, List

# Regex Patterns
CNIC_REGEX = re.compile(r'\b\d{5}[-\s]?\d{7}[-\s]?\d\b')
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
PHONE_REGEX = re.compile(r'(\+92|0)?3\d{2}[-\s]?\d{7}|\b0\d{2,4}[-\s]?\d{6,8}\b')

NAME_TITLES_REGEX = re.compile(
    r'\b(Malik|Khan|Bibi|Syed|Sardar|Mir|Jam|Rind|Bugti|Marri|Mengal|Raisani|Zehri|Zarakzai|Son of|W/O|D/O|S/O|Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
    re.IGNORECASE
)
SPECIFIC_NAME_LABELS_REGEX = re.compile(
    r'(?:respondent_name|beneficiary|full_name|person_name|contact_person|name)\s*[:=]\s*([A-Za-z\s]{2,40})',
    re.IGNORECASE
)

def hash_cnic(cnic_raw: str) -> str:
    """
    Computes deterministic SHA-256 hash prefix for CNIC identity numbers.
    """
    clean_cnic = re.sub(r'[^0-9]', '', cnic_raw)
    if not clean_cnic:
        return cnic_raw
    sha256 = hashlib.sha256(clean_cnic.encode('utf-8')).hexdigest()
    return f"CNIC_HASH_{sha256[:12]}"

def scrub_cnic(text: str) -> str:
    """
    Redacts CNIC numbers matching format 54400-1234567-1 or unformatted 13 digits.
    """
    if not text or not isinstance(text, str):
        return text
    
    def _replace_cnic(match):
        return hash_cnic(match.group(0))

    return CNIC_REGEX.sub(_replace_cnic, text)

def scrub_names(text: str) -> str:
    """
    Redacts person names based on honorifics and explicit name attributes.
    """
    if not text or not isinstance(text, str):
        return text
    
    scrubbed = text
    # Replace labeled names
    def _replace_label(match):
        full = match.group(0)
        name_val = match.group(1).strip()
        if len(name_val) > 1 and not name_val.startswith('ANON_') and not name_val.startswith('[REDACTED'):
            return full.replace(name_val, '[REDACTED_PERSON]')
        return full

    scrubbed = SPECIFIC_NAME_LABELS_REGEX.sub(_replace_label, scrubbed)
    scrubbed = NAME_TITLES_REGEX.sub('[REDACTED_PERSON]', scrubbed)
    return scrubbed

def scrub_contact_info(text: str) -> str:
    """
    Redacts email addresses and phone numbers.
    """
    if not text or not isinstance(text, str):
        return text
    text = EMAIL_REGEX.sub('[REDACTED_EMAIL]', text)
    text = PHONE_REGEX.sub('[REDACTED_PHONE]', text)
    return text

def fuzz_coordinates(lat: float, lon: float) -> Tuple[float, float]:
    """
    Fuzzes GPS coordinates by rounding latitude and longitude to 2 decimal places (~1.1km radius protection).
    """
    try:
        f_lat = round(float(lat), 2)
        f_lon = round(float(lon), 2)
        return (f_lat, f_lon)
    except (ValueError, TypeError):
        return (lat, lon)

def fuzz_geo_string(geo_str: str) -> str:
    """
    Fuzzes KoboToolbox geopoint, geotrace, geoshape WKT/string.
    """
    if not geo_str or not isinstance(geo_str, str):
        return geo_str

    if ';' in geo_str:
        points = [p.strip() for p in geo_str.split(';') if p.strip()]
        fuzzed_points = [fuzz_geo_string(pt) for pt in points]
        return '; '.join(fuzzed_points)

    tokens = geo_str.strip().split()
    if len(tokens) >= 2:
        try:
            lat = float(tokens[0])
            lon = float(tokens[1])
            f_lat, f_lon = fuzz_coordinates(lat, lon)
            tokens[0] = f"{f_lat:.2f}"
            tokens[1] = f"{f_lon:.2f}"
            return ' '.join(tokens)
        except ValueError:
            pass

    return geo_str

def scrub_pii_payload(payload: Union[Dict[str, Any], List[Any], str, int, float, bool]) -> Any:
    """
    Recursively scrubs PII attributes from a payload object before SQL/PostGIS insertion.
    """
    if payload is None:
        return None

    if isinstance(payload, str):
        s = scrub_cnic(payload)
        s = scrub_names(s)
        s = scrub_contact_info(s)
        return s

    if isinstance(payload, (int, float, bool)):
        return payload

    if isinstance(payload, list):
        return [scrub_pii_payload(item) for item in payload]

    if isinstance(payload, dict):
        scrubbed_dict = {}
        
        # Check direct lat/lon numeric coordinates
        has_lat = 'lat' in payload or 'latitude' in payload
        has_lon = 'lon' in payload or 'lng' in payload or 'longitude' in payload

        if has_lat and has_lon:
            lat_key = 'lat' if 'lat' in payload else 'latitude'
            lon_key = 'lon' if 'lon' in payload else ('lng' if 'lng' in payload else 'longitude')
            try:
                f_lat, f_lon = fuzz_coordinates(payload[lat_key], payload[lon_key])
                for k, v in payload.items():
                    if k == lat_key:
                        scrubbed_dict[k] = f_lat
                    elif k == lon_key:
                        scrubbed_dict[k] = f_lon
                    else:
                        scrubbed_dict[k] = scrub_pii_payload(v)
                return scrubbed_dict
            except Exception:
                pass

        for key, val in payload.items():
            key_lower = key.lower()

            if ('cnic' in key_lower) and isinstance(val, str):
                scrubbed_dict[key] = hash_cnic(val) if not val.startswith('CNIC_HASH_') else val
            elif ('name' in key_lower or 'respondent' in key_lower or 'beneficiary' in key_lower) and isinstance(val, str):
                if val.startswith('ANON_NAME_') or val.startswith('CNIC_HASH_') or val == 'Anonymous' or val == '[REDACTED_PERSON]':
                    scrubbed_dict[key] = val
                else:
                    clean_name = scrub_names(val)
                    if clean_name == val and len(val.strip()) > 0:
                        # Deterministic anonymization pseudonym for explicit name fields
                        h = hashlib.sha256(val.encode('utf-8')).hexdigest()[:6]
                        scrubbed_dict[key] = f"ANON_NAME_{h}"
                    else:
                        scrubbed_dict[key] = clean_name
            elif (key_lower in ('geopoint', 'geotrace', 'geoshape')) and isinstance(val, str):
                scrubbed_dict[key] = fuzz_geo_string(val)
            elif ('email' in key_lower or 'phone' in key_lower) and isinstance(val, str):
                scrubbed_dict[key] = scrub_contact_info(val)
            else:
                scrubbed_dict[key] = scrub_pii_payload(val)

        return scrubbed_dict

    return payload
