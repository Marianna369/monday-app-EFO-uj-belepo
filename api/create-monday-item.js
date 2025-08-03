export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body;

  try {
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.VITE_MARIANNA_API_TOKEN
      },
      body: JSON.stringify({ query }),
    });
    console.log('Monday API raw response:', response);

    // Ha a HTTP státusz nem 200-299, akkor hibát dobunk
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API fetch error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to fetch from Monday API' });
    }

    const data = await response.json();
    console.log('Monday API raw response:', data);

    // Ha nincs "data" mező, logoljuk
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
