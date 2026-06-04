export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET 요청: 쿼리 파라미터 사용
    if (req.method === 'GET') {
      const params = new URLSearchParams(req.query);
      const url = `https://www.guerrillamail.com/ajax.php?${params.toString()}`;
      
      console.log('[API GET] Requesting:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.guerrillamail.com/',
        },
      });

      console.log('[API GET] Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Guerrilla Mail API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('[API GET] Response Data:', JSON.stringify(data).substring(0, 200));
      
      return res.status(200).json(data);
    }

    // POST 요청: 폼 데이터 사용
    if (req.method === 'POST') {
      let body = req.body;
      
      // 요청 본문 파싱
      if (typeof body === 'string') {
        body = Object.fromEntries(new URLSearchParams(body));
      }

      console.log('[API POST] Request Body:', JSON.stringify(body).substring(0, 200));

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(body || {})) {
        params.append(key, value);
      }

      console.log('[API POST] Requesting Guerrilla Mail API');

      const response = await fetch('https://www.guerrillamail.com/ajax.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.guerrillamail.com/',
        },
        body: params.toString(),
      });

      console.log('[API POST] Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`Guerrilla Mail API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('[API POST] Response Data:', JSON.stringify(data).substring(0, 200));
      
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[API ERROR]', e.message);
    return res.status(500).json({ 
      error: e.message,
      details: 'Guerrilla Mail API may be unavailable'
    });
  }
}
