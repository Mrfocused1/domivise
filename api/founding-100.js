const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'DomiVise <hello@domivise.co.uk>';
const DEFAULT_TO = 'hello@domivise.co.uk';

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function readRequestBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (_) {
      return Promise.resolve({});
    }
  }

  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
      if (body.length > 20000) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (_) {
        resolve({});
      }
    });

    req.on('error', reject);
  });
}

function buildEmail(payload) {
  const name = clean(payload.Name, 256);
  const email = clean(payload.Email, 256).toLowerCase();
  const portfolioSize = clean(payload['Portfolio-Size'], 64);
  const challenge = clean(payload.Challenge, 2000);
  const source = clean(payload.Source, 128) || 'landing-page';
  const marketingConsent = payload['Marketing-Consent'] === 'yes' ? 'Yes' : 'No';
  const privacyVersion = clean(payload['Privacy-Notice-Version'], 32);
  const programmeNotice = clean(payload['Programme-Communications-Notice'], 500);
  const submittedAt = new Date().toISOString();

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Properties / units', portfolioSize],
    ['Challenge', challenge || 'Not provided'],
    ['Source', source],
    ['Optional marketing consent', marketingConsent],
    ['Privacy notice version', privacyVersion || 'Not provided'],
    ['Programme communications notice', programmeNotice || 'Not provided'],
    ['Submitted at', submittedAt]
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const htmlRows = rows.map(([label, value]) => (
    `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #ede8e4;vertical-align:top;">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #ede8e4;vertical-align:top;">${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`
  )).join('');

  return {
    name,
    email,
    portfolioSize,
    message: {
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [process.env.FOUNDING_NOTIFY_TO || DEFAULT_TO],
      reply_to: email,
      subject: `New Founding 100 application from ${name}`,
      text: `New Founding 100 application\n\n${text}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#252324;line-height:1.5;">
          <h1 style="font-size:22px;margin:0 0 16px;">New Founding 100 application</h1>
          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:720px;">${htmlRows}</table>
        </div>
      `
    }
  };
}

module.exports = async function founding100(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') return sendJson(res, 204, {});
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });

  try {
    if (!process.env.RESEND_API_KEY) {
      return sendJson(res, 500, { error: 'email_not_configured' });
    }

    const payload = await readRequestBody(req);

    if (clean(payload._gotcha, 256)) {
      return sendJson(res, 200, { ok: true });
    }

    const email = clean(payload.Email, 256).toLowerCase();
    const application = buildEmail(payload);

    if (!application.name || !isEmail(email) || !application.portfolioSize) {
      return sendJson(res, 400, { error: 'invalid_submission' });
    }

    const resendResponse = await fetch(RESEND_EMAILS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(application.message)
    });

    if (!resendResponse.ok) {
      let details = {};
      try {
        details = await resendResponse.json();
      } catch (_) {}
      console.error('Resend email failed', {
        status: resendResponse.status,
        code: details && details.name
      });
      return sendJson(res, 502, { error: 'email_send_failed' });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    const status = error && error.message === 'payload_too_large' ? 413 : 500;
    console.error('Founding 100 submission failed', { message: error && error.message });
    return sendJson(res, status, { error: 'submission_failed' });
  }
};
