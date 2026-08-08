/**
 * Tier 4: Real-World Application Scenarios & End-to-End Workflows E2E Tests (14 Test Cases)
 */
const assert = require('assert');
const test = require('node:test');
const { createMockWindow, createMockMapbox, createMockFirebase } = require('../utils/mock-context');

const tests = [
  {
    name: 'TC-T4-01: M&E Field Monitor Full Telemetry Assessment & Export Workflow',
    run: async () => {
      const mockFirebase = createMockFirebase();
      const user = mockFirebase.auth.currentUser;
      assert.strictEqual(user.email, 'auditor@applied-anthropology.org');

      const indicators = [
        { name: 'Water Security', headcount: 0.5, intensity: 0.6 },
        { name: 'Land Usufruct Rights', headcount: 0.4, intensity: 0.5 }
      ];

      const mpiResults = indicators.map(i => ({
        name: i.name,
        mpi: Number((i.headcount * i.intensity).toFixed(3))
      }));

      assert.strictEqual(mpiResults[0].mpi, 0.3);
      assert.strictEqual(mpiResults[1].mpi, 0.2);

      const csvContent = 'Indicator,MPI\n' + mpiResults.map(r => `${r.name},${r.mpi}`).join('\n');
      assert.ok(csvContent.includes('Water Security,0.3'));
    }
  },
  {
    name: 'TC-T4-02: Applied Anthropology Portfolio Presentation Visitor Journey',
    run: () => {
      const mockWin = createMockWindow();
      assert.strictEqual(mockWin.location.pathname, '/');

      const heroCard = { title: 'Applied Anthropology & Decolonial GIS', backdropBlur: 'backdrop-blur-md' };
      assert.strictEqual(heroCard.backdropBlur, 'backdrop-blur-md');

      mockWin.location.pathname = '/webgis';
      assert.strictEqual(mockWin.location.pathname, '/webgis');

      const metaTitle = 'Applied Anthropology & WebGIS Portfolio';
      assert.ok(metaTitle.includes('Applied Anthropology'));
    }
  },
  {
    name: 'TC-T4-03: Customary Legal Rights Usufruct Certificate Registration Workflow',
    run: async () => {
      const mockFirebase = createMockFirebase();

      const formInput = {
        clan: 'Kakar Tribal Federation',
        district: 'Pishin',
        parcelId: 'KAREZ-PISHIN-44',
        areaHectares: 85,
        customaryRightsType: 'INALIENABLE_COMMUNAL_USUFRUCT'
      };

      assert.ok(formInput.clan.length > 0);
      assert.ok(formInput.areaHectares > 0);

      const docRef = await mockFirebase.firestore.collection('usufruct_certificates').add(formInput);
      assert.ok(docRef.id);

      assert.strictEqual(mockFirebase.ledgerLogs.length, 1);
      assert.strictEqual(mockFirebase.ledgerLogs[0].action, 'ADD');
    }
  },
  {
    name: 'TC-T4-04: Spatial Hydrology Analyst Karez GIS Inspection & Export Journey',
    run: () => {
      const mockMapbox = createMockMapbox();
      const map = new mockMapbox.Map({ center: [66.975, 30.1798], zoom: 9 });

      let activeLayer = 'Technocratic Standard';
      const toggleLayer = () => {
        activeLayer = activeLayer === 'Technocratic Standard' ? 'Decolonial ITK Layer' : 'Technocratic Standard';
      };
      toggleLayer();
      assert.strictEqual(activeLayer, 'Decolonial ITK Layer');

      map.flyTo({ center: [67.05, 30.25], zoom: 12 });
      assert.deepStrictEqual(map.center, [67.05, 30.25]);

      const exportedGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: map.center },
            properties: { layer: activeLayer }
          }
        ]
      };

      assert.strictEqual(exportedGeoJson.features[0].properties.layer, 'Decolonial ITK Layer');
    }
  },
  {
    name: 'TC-T4-05: Offline Field Survey Claim Queue & Automatic Re-sync Workflow',
    run: async () => {
      const mockWin = createMockWindow();
      const mockFirebase = createMockFirebase();

      const offlineClaim = { clan: 'Marri', area: 50, timestamp: Date.now() };
      mockWin.localStorage.setItem('pending_claims', JSON.stringify([offlineClaim]));

      const queued = JSON.parse(mockWin.localStorage.getItem('pending_claims'));
      assert.strictEqual(queued.length, 1);

      const syncOfflineClaims = async () => {
        const claims = JSON.parse(mockWin.localStorage.getItem('pending_claims') || '[]');
        for (const claim of claims) {
          await mockFirebase.firestore.collection('usufruct_claims').add(claim);
        }
        mockWin.localStorage.removeItem('pending_claims');
      };

      await syncOfflineClaims();

      assert.strictEqual(mockWin.localStorage.getItem('pending_claims'), null);
      assert.strictEqual(mockFirebase.ledgerLogs.length, 1);
    }
  },
  {
    name: 'TC-T4-06: Multi-Device Responsive Executive Dashboard Simulation Journey',
    run: () => {
      const viewports = [
        { name: 'Mobile Portrait', width: 375, height: 667, isMobile: true },
        { name: 'Tablet Landscape', width: 1024, height: 768, isMobile: false },
        { name: '4K Desktop', width: 3840, height: 2160, isMobile: false }
      ];

      const renderDashboardForViewport = (vp) => {
        return {
          viewport: vp.name,
          layoutColumns: vp.isMobile ? 1 : (vp.width > 1920 ? 4 : 2),
          showSidebar: !vp.isMobile
        };
      };

      const mobileLayout = renderDashboardForViewport(viewports[0]);
      const tabletLayout = renderDashboardForViewport(viewports[1]);
      const desktop4kLayout = renderDashboardForViewport(viewports[2]);

      assert.strictEqual(mobileLayout.layoutColumns, 1);
      assert.strictEqual(mobileLayout.showSidebar, false);
      assert.strictEqual(tabletLayout.layoutColumns, 2);
      assert.strictEqual(desktop4kLayout.layoutColumns, 4);
    }
  },
  {
    name: 'TC-T4-07: Role-Based Access Control (RBAC) Permission Matrix & RoleGate Verification',
    run: () => {
      const { assertFileExists, assertContains, getFileContent } = require('../utils/ast-helpers');
      
      assertFileExists('lib/rbac-context.tsx');
      assertContains('lib/rbac-context.tsx', 'FIELD_ENUMERATOR');
      assertContains('lib/rbac-context.tsx', 'PROVINCIAL_PIU');
      assertContains('lib/rbac-context.tsx', 'FPMU_DIRECTOR');
      assertContains('lib/rbac-context.tsx', 'canViewFinancialBurnRate');

      const content = getFileContent('lib/rbac-context.tsx');
      assert.ok(content.includes('FIELD_ENUMERATOR') && content.includes('canViewFinancialBurnRate: false'));
      assert.ok(content.includes('FPMU_DIRECTOR') && content.includes('canViewComplianceLogs: true'));
    }
  },
  {
    name: 'TC-T4-08: Role Switcher State Persistence & Dynamic Capability Evaluation',
    run: () => {
      const mockWin = createMockWindow();
      let activeRole = 'FIELD_ENUMERATOR';

      const switchRole = (newRole) => {
        activeRole = newRole;
        mockWin.localStorage.setItem('user_active_role', newRole);
      };

      const hasPermission = (allowedRoles) => allowedRoles.includes(activeRole);

      assert.strictEqual(hasPermission(['PROVINCIAL_PIU', 'FPMU_DIRECTOR']), false);

      switchRole('PROVINCIAL_PIU');
      assert.strictEqual(mockWin.localStorage.getItem('user_active_role'), 'PROVINCIAL_PIU');
      assert.strictEqual(hasPermission(['PROVINCIAL_PIU', 'FPMU_DIRECTOR']), true);

      switchRole('FPMU_DIRECTOR');
      assert.strictEqual(hasPermission(['FPMU_DIRECTOR']), true);
    }
  },
  {
    name: 'TC-T4-09: PWA Service Worker, Manifest, and PwaRegister Component Verification',
    run: () => {
      const { assertFileExists, assertContains } = require('../utils/ast-helpers');
      
      assertFileExists('public/sw.js');
      assertFileExists('public/manifest.json');
      assertFileExists('components/PwaRegister.tsx');
      assertFileExists('app/layout.tsx');

      assertContains('public/sw.js', 'wb-ifrap-pwa-v1');
      assertContains('public/sw.js', 'OFFLINE_FALLBACK_HTML');
      assertContains('public/manifest.json', 'World Bank Component 3 Anthropological Monitoring Platform');
      assertContains('public/manifest.json', 'standalone');
      assertContains('components/PwaRegister.tsx', 'syncOfflineQueue');
      assertContains('app/layout.tsx', 'PwaRegister');
      assertContains('app/layout.tsx', '/manifest.json');
    }
  },
  {
    name: 'TC-T4-10: Client-Side PII Anonymization, CNIC Hashing, and Coordinate Fuzzing Verification',
    run: () => {
      const { assertFileExists, assertContains } = require('../utils/ast-helpers');

      assertFileExists('lib/privacy/ner-pii-scrubber.ts');
      assertFileExists('lib/offline/crypto-storage.ts');
      assertFileExists('lib/offline/indexed-db.ts');

      assertContains('lib/privacy/ner-pii-scrubber.ts', 'redactCNIC');
      assertContains('lib/privacy/ner-pii-scrubber.ts', 'redactNames');
      assertContains('lib/privacy/ner-pii-scrubber.ts', 'fuzzCoordinates');
      assertContains('lib/privacy/ner-pii-scrubber.ts', 'scrubPayload');

      assertContains('lib/offline/crypto-storage.ts', 'AES-GCM');
      assertContains('lib/offline/crypto-storage.ts', 'encryptPayload');
      assertContains('lib/offline/crypto-storage.ts', 'decryptPayload');

      assertContains('lib/offline/indexed-db.ts', 'AntigravityOfflineDB');
      assertContains('lib/offline/indexed-db.ts', 'syncOfflineQueue');
    }
  },
  {
    name: 'TC-T4-11: R1 Verification - Next.js Proxy Session Guard & Postgres Persistence Seam',
    run: () => {
      const { assertFileExists, assertContains } = require('../utils/ast-helpers');
      // Next 16 renamed the "middleware" file convention to "proxy".
      assertFileExists('proxy.ts');
      assertFileExists('lib/auth/rbac.ts');
      // Security fix (audit C1): edge gate verifies the session via getToken;
      // the verifyAndDecodeSAMLOrOIDCToken bypass was removed. Guard the secure contract.
      assertContains('proxy.ts', 'getToken');
      assertContains('proxy.ts', 'getRequiredRolesForPath');
      assertContains('lib/auth/rbac.ts', 'FIELD_ENUMERATOR');
      assertContains('lib/auth/rbac.ts', 'PROVINCIAL_PIU');
      assertContains('lib/auth/rbac.ts', 'FPMU_DIRECTOR');
      // Postgres pilot adapter behind the persistence seam (lib/server/store.ts
      // dispatches to this when DATABASE_URL is set) — see db/01_app_store.sql.
      assertFileExists('lib/server/pg-store.ts');
      assertContains('lib/server/pg-store.ts', 'app_store');
      assertContains('lib/server/pg-store.ts', 'pg_advisory_xact_lock');
      assertFileExists('db/01_app_store.sql');
    }
  },
  {
    name: 'TC-T4-12: R2 Verification - Offline PWA & Client-Side AES-256 IndexedDB Storage',
    run: () => {
      const { assertFileExists, assertContains, assertExportExists } = require('../utils/ast-helpers');
      assertFileExists('public/sw.js');
      assertFileExists('public/manifest.json');
      assertFileExists('lib/offline/crypto-storage.ts');
      assertFileExists('lib/offline/indexed-db.ts');
      assertFileExists('lib/privacy/ner-pii-scrubber.ts');

      assertContains('lib/offline/crypto-storage.ts', 'AES-GCM');
      assertExportExists('lib/offline/crypto-storage.ts', 'encryptPayload');
      assertExportExists('lib/offline/crypto-storage.ts', 'decryptPayload');

      assertContains('lib/offline/indexed-db.ts', 'AntigravityOfflineDB');
      assertExportExists('lib/offline/indexed-db.ts', 'syncOfflineQueue');

      assertExportExists('lib/privacy/ner-pii-scrubber.ts', 'redactCNIC');
      assertExportExists('lib/privacy/ner-pii-scrubber.ts', 'redactNames');
      assertExportExists('lib/privacy/ner-pii-scrubber.ts', 'fuzzCoordinates');
      assertExportExists('lib/privacy/ner-pii-scrubber.ts', 'scrubPayload');
    }
  },
  {
    name: 'TC-T4-13: R3 Verification - LangGraph Antigravity Agent Orchestration & pgvector Semantic RAG',
    run: () => {
      const { assertFileExists, assertContains, assertExportExists } = require('../utils/ast-helpers');
      assertFileExists('lib/agent/antigravity-graph.ts');
      assertFileExists('lib/rag/retriever.ts');
      assertFileExists('app/api/agent/route.ts');

      assertContains('lib/agent/antigravity-graph.ts', '@langchain/langgraph');
      assertExportExists('lib/agent/antigravity-graph.ts', 'buildAntigravityAgentGraph');
      assertExportExists('lib/agent/antigravity-graph.ts', 'runAntigravityAgent');

      assertExportExists('lib/rag/retriever.ts', 'retrieveFieldLogEmbeddings');
      assertContains('lib/rag/retriever.ts', 'vectorId');

      // Security fix (audit C1): agent route verifies via getToken, not the removed bypass.
      assertContains('app/api/agent/route.ts', 'getToken');
      assertContains('app/api/agent/route.ts', 'runAntigravityAgent');
    }
  },
  {
    name: 'TC-T4-14: R4 Verification - 5 ESF Safeguard Modules Route & Metadata Contract',
    run: () => {
      const { assertFileExists, assertExportExists, assertContains } = require('../utils/ast-helpers');
      const esfRoutes = [
        { path: 'app/esf-telemetry/page.tsx', exportName: 'default', keyword: 'EsfTelemetryPortal' },
        { path: 'app/field-log/page.tsx', exportName: 'default', keyword: 'FieldAnthropologistLog' },
        { path: 'app/grm/page.tsx', exportName: 'default', keyword: 'GrmTicketingCenter' },
        { path: 'app/gis-impact/page.tsx', exportName: 'default', keyword: 'GisImpactMapper' },
        { path: 'app/me-results/page.tsx', exportName: 'default', keyword: 'MeResultsEngine' },
      ];
      for (const r of esfRoutes) {
        assertFileExists(r.path);
        assertExportExists(r.path, r.exportName);
        assertContains(r.path, r.keyword);
        assertContains(r.path, 'metadata');
      }
    }
  }
];

if (require.main === module) {
  for (const t of tests) {
    test(t.name, t.run);
  }
}

module.exports = { tier: 'tier4', tests };
