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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.guerrillamail.com/',
        },
      });

      const data = await response.json();
      return res.status(200).json(data);
    }

    // POST 요청: 폼 데이터 사용
    if (req.method === 'POST') {
      // 요청 본문이 이미 파싱되어 있는지 확인
      let body = req.body;
      
      // 만약 문자열이면 파싱
      if (typeof body === 'string') {
        body = Object.fromEntries(new URLSearchParams(body));
      }

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(body || {})) {
        params.append(key, value);
      }

      const response = await fetch('https://www.guerrillamail.com/ajax.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.guerrillamail.com/',
        },
        body: params.toString(),
      });

      const data = await response.json();
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('API Error:', e);
    res.status(500).json({ error: e.message });
  }
}
