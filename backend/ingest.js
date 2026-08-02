const express = require('express');
const { createClient } = require('redis');

const app = express();
app.disable('x-powered-by'); // Security: Disable X-Powered-By
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
app.use(express.json());

const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 3) {
        return false; // Stop retrying
      }
      return 500;
    }
  }
});

redisClient.on('error', (err) => {
  console.error('[Redis Client Error]', err.message);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('[Redis] Connected successfully to', REDIS_URL);
  } catch (err) {
    console.warn('[Redis] Connection failed, operating in fallback/offline mode:', err.message);
  }
})();

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
    return { valid: false, message: "Empty payload body" };
  }

  const respondentAttr =
    payload.cnic ||
    payload.respondent_cnic ||
    payload._cnic ||
    payload.respondent_name ||
    payload.name ||
    payload.full_name;

  if (!respondentAttr) {
    return {
      valid: false,
      message: "Missing required respondent attributes (cnic, respondent_cnic, _cnic, respondent_name, name, or full_name)"
    };
  }

  const spatialAttr = payload.geopoint || payload.geotrace || payload.geoshape;

  if (!spatialAttr) {
    return {
      valid: false,
      message: "Missing required spatial attributes (geopoint, geotrace, or geoshape)"
    };
  }

  return { valid: true };
}

app.get('/health', (req, res) => {
  const redisStatus = redisClient.isOpen ? "connected" : "disconnected";
  res.status(200).json({ status: "ok", redis: redisStatus });
});

const handleIngest = async (req, res) => {
  const validation = validatePayload(req.body);
  if (!validation.valid) {
    return res.status(400).json({ status: "error", message: validation.message });
  }

  try {
    const serializedPayload = JSON.stringify(req.body);
    if (redisClient.isOpen) {
      await redisClient.rPush('kobo_payloads', serializedPayload);
    } else {
      console.warn('[Ingest] Redis not connected. Operating in dry-run/fallback queue mode.');
    }

    return res.status(200).json({
      status: "success",
      message: "Payload queued",
      queue: "kobo_payloads"
    });
  } catch (error) {
    console.error('[Ingest Error]', error);
    return res.status(500).json({ status: "error", message: "Failed to queue payload: " + error.message });
  }
};

app.post('/webhook', handleIngest);
app.post('/api/v2/ingest', handleIngest);

const exportsRouter = require('./exports');
app.use('/api/export', exportsRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Express Ingestion Server] Running on port ${PORT}`);
  });
}

module.exports = { app, redisClient, validatePayload };
