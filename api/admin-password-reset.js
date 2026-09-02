const ADMIN_EMAIL = 'hello@domivise.co.uk';
const DEFAULT_FROM = 'DomiVise <hello@domivise.co.uk>';
const DEFAULT_REDIRECT = 'https://www.domivise.co.uk/admin?recovery=1';
const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function clean(value) {
  if (typeof value !== 'string') return '';
  let cleaned = value.trim().replace(/\\n/g, '').replace(/\\r/g, '').trim();
  if (
    (cleaned.charAt(0) === '"' && cleaned.charAt(cleaned.length - 1) === '"') ||
    (cleaned.charAt(0) === "'" && cleaned.charAt(cleaned.length - 1) === "'")
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function resolveSupabaseConfig() {
  return {
    url: clean(process.env.SUPABASE_URL) || clean(process.env.NEXT_PUBLIC_SUPABASE_URL) || clean(process.env.DOMIVISE_SUPABASE_URL),
    key: clean(process.env.SUPABASE_PUBLISHABLE_KEY) || clean(process.env.SUPABASE_ANON_KEY) || clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || clean(process.env.DOMIVISE_SUPABASE_PUBLISHABLE_KEY)
  };
}

function readRequestBody(request) {
  if (request.body && typeof request.body === 'object') return Promise.resolve(request.body);
  if (typeof request.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(request.body));
    } catch (_) {
      return Promise.resolve({});
    }
  }

  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 5000) {
        reject(new Error('payload_too_large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (_) {
        resolve({});
      }
    });
    request.on('error', reject);
  });
}

function html(message) {
  return String(message).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

async function requestRecoveryToken(config, email, redirectTo) {
  const response = await fetch(`${config.url.replace(/\/$/, '')}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const error = new Error('supabase_recovery_failed');
    error.status = response.status;
    throw error;
  }
}

async function readRecoveryTokenHash(config, email) {
  const response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/rpc/admin_recovery_token_hash`, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Admin-Reset-Secret': clean(process.env.ADMIN_RESET_SECRET)
    },
    body: JSON.stringify({ target_email: email })
  });

  if (!response.ok) {
    const error = new Error('recovery_token_unavailable');
    error.status = response.status;
    throw error;
  }

  const tokenHash = await response.json();
  if (!tokenHash || typeof tokenHash !== 'string') throw new Error('recovery_token_unavailable');
  return tokenHash;
}

async function sendResetEmail(email, link) {
  const response = await fetch(RESEND_EMAIL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [email],
      subject: 'Reset your DomiVise admin password',
      text: `Use this secure link to reset your DomiVise admin password:\n\n${link}\n\nIf you did not request this, ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#252324;line-height:1.6;">
          <h1 style="font-size:22px;margin:0 0 16px;">Reset your DomiVise admin password</h1>
          <p>Use this secure link to choose a new password:</p>
          <p><a href="${html(link)}" style="display:inline-block;background:#19251d;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;">Reset password</a></p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const error = new Error('resend_failed');
    error.status = response.status;
    throw error;
  }
}

module.exports = async function adminPasswordReset(request, response) {
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'method_not_allowed' });

  try {
    const body = await readRequestBody(request);
    const email = clean(body.email).toLowerCase();

    if (email !== ADMIN_EMAIL) return sendJson(response, 200, { ok: true });

    const config = resolveSupabaseConfig();
    if (!config.url || !config.key || !process.env.RESEND_API_KEY || !process.env.ADMIN_RESET_SECRET) {
      return sendJson(response, 500, { error: 'reset_not_configured' });
    }

    const redirectTo = clean(body.redirectTo) || DEFAULT_REDIRECT;
    await requestRecoveryToken(config, email, redirectTo);
    const tokenHash = await readRecoveryTokenHash(config, email);
    const resetLink = `${config.url.replace(/\/$/, '')}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;
    await sendResetEmail(email, resetLink);

    return sendJson(response, 200, { ok: true });
  } catch (error) {
    const status = error && error.status === 429 ? 429 : 502;
    console.error('Admin password reset failed', {
      reason: error && error.message,
      status: error && error.status
    });
    return sendJson(response, status, { error: 'reset_email_failed' });
  }
};
