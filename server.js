import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const TALORDATA_KEY = 'd3f0553493deb4ae2ad3d49f5d0eb4d3';
const TALORDATA_URL = 'https://serpapi.talordata.net/serp/v1/request';

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.options('/proxy', cors());
app.post('/proxy', async (req, res) => {
  try {
    const params = new URLSearchParams(req.body);
    const talorRes = await fetch(TALORDATA_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TALORDATA_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await talorRes.json();
    res.status(talorRes.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ LUXN server running on port ${PORT}`);
});
