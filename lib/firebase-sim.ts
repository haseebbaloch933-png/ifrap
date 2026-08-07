/**
 * Simulated Firebase SDK Module & Fiduciary Ledger Security Engine
 * For MIRAB — IFRAP Component 3 Platform (water governance & M&E telemetry)
 */

export interface LedgerLog {
  action: string;
  timestamp: number;
  metadata?: any;
  path?: string;
  data?: any;
  docId?: string;
}

export const ledgerLogs: LedgerLog[] = [];

export const store: Record<string, any> = {};

export const auth = {
  currentUser: {
    uid: 'usr_auditor_123',
    email: 'auditor@applied-anthropology.org',
    role: 'FIDUCIARY_AUDITOR',
  },
  signInWithCustomToken: async () => true,
};

export const firestore = {
  collection: (collectionName: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => {
        store[`${collectionName}/${id}`] = { ...data, updatedAt: new Date().toISOString() };
        ledgerLogs.push({
          action: 'SET',
          timestamp: Date.now(),
          path: `${collectionName}/${id}`,
          metadata: data,
          data,
          docId: id,
        });
        return true;
      },
      get: async () => ({
        exists: Boolean(store[`${collectionName}/${id}`]),
        data: () => store[`${collectionName}/${id}`],
      }),
    }),
    add: async (data: any) => {
      const id = 'USU-' + Math.floor(100000 + Math.random() * 900000);
      store[`${collectionName}/${id}`] = { ...data, createdAt: new Date().toISOString() };
      ledgerLogs.push({
        action: 'ADD',
        timestamp: Date.now(),
        path: `${collectionName}/${id}`,
        metadata: data,
        data,
        docId: id,
      });
      return { id };
    },
  }),
};

export const firebase = {
  auth,
  firestore,
  ledgerLogs,
  store,
};

/**
 * Security & Sanitization Utility Functions
 */

export function sanitizeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeQueryParam(param: string): string {
  if (typeof param !== 'string') return '';
  return param.replace(/(\$|DROP|DELETE|UPDATE|INSERT|SELECT|--|;)/gi, '');
}

export function validateFilePath(filename: string): { valid: boolean; error?: string; filename?: string } {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: 'PATH_TRAVERSAL_DETECTED' };
  }
  return { valid: true, filename };
}

export function safeMerge(target: any, source: any): any {
  if (!target || typeof target !== 'object') target = {};
  if (!source || typeof source !== 'object') return target;

  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
