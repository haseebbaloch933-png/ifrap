/**
 * Mock Context Helpers for E2E Testing Framework
 */

function createMockWindow() {
  const listeners = {};
  const storage = {};

  return {
    addEventListener: (event, handler) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
      }
    },
    dispatchEvent: (event, payload) => {
      if (listeners[event]) {
        listeners[event].forEach(h => h(payload));
      }
    },
    localStorage: {
      getItem: (key) => storage[key] || null,
      setItem: (key, val) => { storage[key] = String(val); },
      removeItem: (key) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    location: {
      href: 'http://localhost:3000/',
      pathname: '/',
      search: '',
      hash: ''
    }
  };
}

function createMockMapbox() {
  const sources = {};
  const layers = {};
  const eventListeners = {};

  return {
    Map: class MockMap {
      constructor(options = {}) {
        this.options = options;
        this.center = options.center || [66.9750, 30.1798];
        this.zoom = options.zoom || 7;
      }
      on(event, cb) {
        eventListeners[event] = eventListeners[event] || [];
        eventListeners[event].push(cb);
        if (event === 'load') setTimeout(cb, 10);
      }
      addSource(id, source) {
        sources[id] = source;
      }
      addLayer(layer) {
        layers[layer.id] = layer;
      }
      removeLayer(id) {
        delete layers[id];
      }
      setLayoutProperty(layerId, name, value) {
        if (layers[layerId]) {
          layers[layerId].layout = layers[layerId].layout || {};
          layers[layerId].layout[name] = value;
        }
      }
      flyTo(opts) {
        if (opts.center) this.center = opts.center;
        if (opts.zoom) this.zoom = opts.zoom;
      }
      remove() {}
    },
    sources,
    layers,
    eventListeners
  };
}

function createMockFirebase() {
  const store = {};
  const ledgerLogs = [];

  return {
    auth: {
      currentUser: { uid: 'usr_test_123', email: 'auditor@applied-anthropology.org' },
      signInWithCustomToken: async () => true
    },
    firestore: {
      collection: (name) => ({
        doc: (id) => ({
          set: async (data) => {
            store[`${name}/${id}`] = { ...data, updatedAt: new Date().toISOString() };
            ledgerLogs.push({ action: 'SET', path: `${name}/${id}`, data });
            return true;
          },
          get: async () => ({
            exists: Boolean(store[`${name}/${id}`]),
            data: () => store[`${name}/${id}`]
          })
        }),
        add: async (data) => {
          const id = 'doc_' + Math.random().toString(36).substr(2, 9);
          store[`${name}/${id}`] = { ...data, createdAt: new Date().toISOString() };
          ledgerLogs.push({ action: 'ADD', path: `${name}/${id}`, data });
          return { id };
        }
      })
    },
    ledgerLogs,
    store
  };
}

function createMockNextRequest(url, options = {}) {
  const parsedUrl = new URL(url, 'http://localhost:3000');
  return {
    url: parsedUrl.toString(),
    nextUrl: parsedUrl,
    method: options.method || 'GET',
    headers: new Map(Object.entries(options.headers || {})),
    json: async () => options.body || {},
    text: async () => JSON.stringify(options.body || {})
  };
}

module.exports = {
  createMockWindow,
  createMockMapbox,
  createMockFirebase,
  createMockNextRequest
};
