const SUPABASE_URL = 'https://eocipinztulbhkjufrkn.supabase.co';

function clean(value) {
  if (typeof value !== 'string') return '';
  var cleaned = value.trim().replace(/\\n/g, '').replace(/\\r/g, '').trim();
  if (
    (cleaned.charAt(0) === '"' && cleaned.charAt(cleaned.length - 1) === '"') ||
    (cleaned.charAt(0) === "'" && cleaned.charAt(cleaned.length - 1) === "'")
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function getPublishableKey() {
  return (
    clean(process.env.SUPABASE_PUBLISHABLE_KEY) ||
    clean(process.env.SUPABASE_ANON_KEY) ||
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    clean(process.env.DOMIVISE_SUPABASE_PUBLISHABLE_KEY) ||
    ''
  );
}

module.exports = function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.status(200).json({
    url: clean(process.env.SUPABASE_URL) || clean(process.env.NEXT_PUBLIC_SUPABASE_URL) || clean(process.env.DOMIVISE_SUPABASE_URL) || SUPABASE_URL,
    publishableKey: getPublishableKey()
  });
};
