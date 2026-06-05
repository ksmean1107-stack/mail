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

  let bodyStr = undefined;
  if (hasBody) {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      bodyStr = JSON.stringify(req.body);
    } else if (typeof req.body === 'string' && req.body.length > 0) {
      bodyStr = req.body;
    } else {
      bodyStr = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data || '{}'));
        req.on('error', () => resolve('{}'));
      });
    }
  }

  try {
    // fetch 가용 여부 체크
    if (typeof fetch === 'undefined') {
      return res.status(500).json({ error: 'fetch_unavailable', detail: 'fetch is not defined in this runtime' });
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? bodyStr : undefined,
    });

    const text = await response.text();

    if (!text || text.trim() === '') {
      return res.status(500).json({
        error: 'empty_response',
        upstream_status: response.status,
        upstream_url: url,
        method: req.method,
        body_sent: bodyStr ?? null,
      });
    }

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({
      error: 'proxy_exception',
      message: e.message,
      stack: e.stack?.split('\n').slice(0, 5),
      upstream_url: url,
      method: req.method,
    });
  }
}
