export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...query } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : (path || '');
  const qs = new URLSearchParams(query).toString();
  const url = `https://api.mail.tm/${apiPath}${qs ? '?' + qs : ''}`;

  const hasBody = ['POST', 'PATCH'].includes(req.method);

  const headers = {};
  if (hasBody) {
    // /accounts 엔드포인트는 ld+json 필요
    headers['Content-Type'] = apiPath === 'accounts'
      ? 'application/ld+json'
      : 'application/json';
  }
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
