const SUPABASE_URL = 'https://eocipinztulbhkjufrkn.supabase.co';

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
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
