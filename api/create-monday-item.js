export default async function handler(req, res) {
  // CORS beállítások
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Lekérdezés kinyerése POST vagy GET esetén
  const query = req.method === 'POST' ? req.body.query : req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST', // Monday API mindig POST-ot vár
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.VITE_ADMIN_API_TOKEN || ''
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Monday API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to fetch from Monday API' });
    }

    const data = await response.json();

    if (!data || !data.data) {
      console.error('Invalid response format from Monday API:', data);
      return res.status(500).json({ error: 'Invalid response from Monday API' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
