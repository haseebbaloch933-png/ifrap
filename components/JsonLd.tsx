import { getJsonLd } from '@/lib/json-ld';

export default function JsonLd() {
  const jsonLd = getJsonLd();
  const jsonString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
