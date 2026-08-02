## 2026-08-02T04:23:12Z

You are Worker M2 (Offline PWA & Data Privacy) for the World Bank Component 3 Anthropological Monitoring Platform.
Working Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m2_pwa_pii

Your instructions:
1. Read Explorer 2's analysis at C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_wb_2\analysis.md and SCOPE.md at C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\orchestrator\SCOPE.md.
2. Implement Requirement R2:
   a. Offline-first PWA:
      - Create `public/sw.js` (Service Worker with asset caching, offline page fallback, network status handling).
      - Create `public/manifest.json` (Web App Manifest for World Bank Component 3 Anthropological Monitoring Platform).
      - Create `components/PwaRegister.tsx` (Client-side Service Worker registration component + online/offline status bar).
      - Update `app/layout.tsx` to include `PwaRegister`.
   b. IndexedDB AES-256 local encrypted storage:
      - Create `lib/offline/crypto-storage.ts` using Web Crypto API (`crypto.subtle`) for 256-bit AES-GCM key generation, encryption, and decryption.
      - Create `lib/offline/indexed-db.ts` implementing `AntigravityOfflineDB` for storing encrypted field log drafts, survey forms, and GRM tickets offline. Include an automatic re-sync routine (`syncOfflineQueue()`) when internet connectivity returns.
   c. Automated PII anonymization & NER pipeline:
      - Create `lib/privacy/ner-pii-scrubber.ts` for client/TypeScript PII redaction:
        * Redacts person names.
        * Redacts CNIC numbers matching `\d{5}-\d{7}-\d{1}`.
        * Redacts email addresses and phone numbers.
        * Fuzzes GPS coordinates (rounds latitude/longitude to 2 decimal places, ~1.1km radius protection).
      - Create/update `backend/pii_scrubber.py` for server-side Python NER PII scrubbing fallback before PostGIS database insertion.
3. Verify your implementation by running `npm run build` via command tool. Ensure clean compilation.
4. Document all changed files, build results, and verification in C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m2_pwa_pii\handoff.md.
5. Send a message to parent with your summary and handoff report path.
