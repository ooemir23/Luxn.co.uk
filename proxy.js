/**
 * LUXN — TalorData proxy (Node.js, fetch-based, requires Node 18+)
 * Run: node proxy.js
 * Listens on http://localhost:8000
 */

const http = require('http');

const PORT          = 8000;
const TALORDATA_KEY = 'd3f0553493deb4ae2ad3d49f5d0eb4d3';
const TALORDATA_URL = 'https://serpapi.talordata.net/serp/v1/request';

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

http.createServer(async (req, res) => {

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // Collect body
  let body = await new Promise(resolve => {
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', () => resolve(raw));
  });

  // GET → use query string as body
  if (req.method === 'GET' && req.url.includes('?')) {
    body = req.url.split('?')[1];
  }

  if (!body.includes('q=')) {
    res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing required param: q' }));
    return;
  }

  try {
    const talorRes = await fetch(TALORDATA_URL, {
      method : 'POST',
      headers: {
        'Authorization': `Bearer ${TALORDATA_KEY}`,
        'Content-Type' : 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await talorRes.json();
    res.writeHead(talorRes.status, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));

  } catch (err) {
    res.writeHead(502, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }

}).listen(PORT, () => {
  console.log(`✓ LUXN proxy running → http://localhost:${PORT}`);
  console.log(`  Test: http://localhost:${PORT}?q=luxury+hotels+Paris&check_in_date=2026-06-10&check_out_date=2026-06-17&adults=2`);
});
