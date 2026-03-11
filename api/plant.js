// api/plant.js — PlantNet proxy (hindari CORS dari browser)
// Deploy ke Vercel repo baseject/api

const PNKEY = process.env.PLANTNET_KEY || '2b10U4FggShOkdudlJPFa6Jpe';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).end();
  }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Baca raw body sebagai buffer
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);

    // Ambil content-type dari request (FormData)
    const contentType = req.headers['content-type'] || '';

    const pnResp = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?include-related-images=false&no-reject=false&nb-results=3&lang=id&api-key=${PNKEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: rawBody,
      }
    );

    const data = await pnResp.json();
    return res.status(pnResp.status).json(data);
  } catch (err) {
    console.error('[plant]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
