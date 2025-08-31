export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // <- GET hozzáadva
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Keresési lekérdezés kinyerése:
  const query = req.method === 'POST'
    ? req.body.query
    : req.query.query; // ha GET, akkor URL paraméterből

  try {
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST', // ide mindig POST kell, mert a Monday GraphQL API ilyen
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.VITE_ADMIN_API_TOKEN
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API fetch error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to fetch from Monday API' });
    }

    const data = await response.json();

    if (!data || !data.data) {
      console.error('Unexpected API response format:', data);
      return res.status(500).json({ error: 'Invalid response from Monday API' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
