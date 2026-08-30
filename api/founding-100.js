const RESEND_BATCH_URL = 'https://api.resend.com/emails/batch';
const RESEND_CONTACTS_URL = 'https://api.resend.com/contacts';
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

function splitName(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: name, lastName: '' };

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1]
  };
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
    messages: [
      {
        from: process.env.RESEND_FROM || DEFAULT_FROM,
        to: [email],
        subject: 'Welcome to the DomiVise Founding 100',
        text: [
          `Hi ${name},`,
          '',
          'Thanks for applying to join the DomiVise Founding 100.',
          '',
          'We have received your details and will contact you about private-beta access and next steps as the product comes together.',
          '',
          'DomiVise will support landlords across England, Wales, Scotland and Northern Ireland, with guidance tailored to the relevant jurisdiction.',
          '',
          'Derryal Swaby',
          'Founder, DomiVise'
        ].join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;color:#252324;line-height:1.6;">
            <h1 style="font-size:22px;margin:0 0 16px;">Welcome to the DomiVise Founding 100</h1>
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thanks for applying to join the DomiVise Founding 100.</p>
            <p>We have received your details and will contact you about private-beta access and next steps as the product comes together.</p>
            <p>DomiVise will support landlords across England, Wales, Scotland and Northern Ireland, with guidance tailored to the relevant jurisdiction.</p>
            <p style="margin-top:24px;">Derryal Swaby<br>Founder, DomiVise</p>
          </div>
        `
      },
      {
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
    ]
  };
}

function buildContact(payload) {
  const name = clean(payload.Name, 256);
  const email = clean(payload.Email, 256).toLowerCase();
  const marketingConsent = payload['Marketing-Consent'] === 'yes';
  const nameParts = splitName(name);

  return {
    email,
    body: {
      email,
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      unsubscribed: !marketingConsent
    }
  };
}

async function resendFetch(url, options) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options && options.headers)
    }
  });
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch (_) {
    return {};
  }
}

function isExistingContactFailure(response, details) {
  const detailText = JSON.stringify(details || {}).toLowerCase();
  return response.status === 409 || detailText.includes('already') || detailText.includes('exist');
}

async function syncContact(contact) {
  const createResponse = await resendFetch(RESEND_CONTACTS_URL, {
    method: 'POST',
    body: JSON.stringify(contact.body)
  });

  if (createResponse.ok) return;

  const createDetails = await parseJsonSafely(createResponse);
  if (!isExistingContactFailure(createResponse, createDetails)) {
    console.error('Resend contact create failed', {
      status: createResponse.status,
      code: createDetails && createDetails.name
    });
    throw new Error('contact_sync_failed');
  }

  const updateResponse = await resendFetch(`${RESEND_CONTACTS_URL}/${encodeURIComponent(contact.email)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      first_name: contact.body.first_name,
      last_name: contact.body.last_name,
      unsubscribed: contact.body.unsubscribed
    })
  });

  if (!updateResponse.ok) {
    const updateDetails = await parseJsonSafely(updateResponse);
    console.error('Resend contact update failed', {
      status: updateResponse.status,
      code: updateDetails && updateDetails.name
    });
    throw new Error('contact_sync_failed');
  }
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
    const contact = buildContact(payload);

    if (!application.name || !isEmail(email) || !application.portfolioSize) {
      return sendJson(res, 400, { error: 'invalid_submission' });
    }

    await syncContact(contact);

    const resendResponse = await resendFetch(RESEND_BATCH_URL, {
      method: 'POST',
      body: JSON.stringify(application.messages)
    });

    if (!resendResponse.ok) {
      const details = await parseJsonSafely(resendResponse);
      console.error('Resend email batch failed', {
        status: resendResponse.status,
        code: details && details.name
      });
      return sendJson(res, 502, { error: 'email_send_failed' });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    const status = error && error.message === 'payload_too_large'
      ? 413
      : error && error.message === 'contact_sync_failed'
        ? 502
        : 500;
    const code = error && error.message === 'contact_sync_failed' ? 'contact_sync_failed' : 'submission_failed';
    console.error('Founding 100 submission failed', { message: error && error.message });
    return sendJson(res, status, { error: code });
  }
};
