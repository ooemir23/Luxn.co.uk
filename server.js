import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Otelz API configuration
const OTELZ_URL = process.env.OTELZ_URL || 'https://api.otelz.com/v1';
const OTELZ_KEY = process.env.OTELZ_KEY || '';

app.options('/proxy', cors());
app.post('/proxy', async (req, res) => {
  try {
    const { endpoint, ...body } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    if (!OTELZ_KEY || !OTELZ_URL) {
      console.warn('⚠️  Otelz credentials not configured, returning mock response');
      // Mock response for development
      return res.json({
        properties: [],
        hotel: null,
        rates: [],
        confirmationCode: 'LUX-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        status: 'DEVELOPMENT_MODE'
      });
    }

    const otelzUrl = `${OTELZ_URL}${endpoint}`;
    console.log(`[LUXN proxy] Forwarding to Otelz: ${otelzUrl}`);

    const otelzRes = await fetch(otelzUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OTELZ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      timeout: 10000
    });

    if (!otelzRes.ok) {
      const errorText = await otelzRes.text();
      console.error(`[LUXN proxy] Otelz error ${otelzRes.status}: ${errorText}`);
      return res.status(otelzRes.status).json({
        error: `Otelz API error: ${otelzRes.status}`,
        details: errorText.slice(0, 200)
      });
    }

    const data = await otelzRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('[LUXN proxy] Error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ LUXN server running on port ${PORT}`);
});
