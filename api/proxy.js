export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...query } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : (path || '');
  const qs = new URLSearchParams(query).toString();
  const url = `https://api.mail.tm/${apiPath}${qs ? '?' + qs : ''}`;

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

  const headers = { 'Content-Type': 'application/json' };
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  // Vercel이 body를 파싱 못했을 경우 raw stream에서 읽기
  let bodyStr = undefined;
  if (hasBody) {
    if (req.body && typeof req.body === 'object') {
      bodyStr = JSON.stringify(req.body);
    } else if (typeof req.body === 'string') {
      bodyStr = req.body;
    } else {
      bodyStr = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', () => resolve('{}'));
      });
    }
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? bodyStr : undefined,
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
