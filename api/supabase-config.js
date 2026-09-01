const SUPABASE_URL = 'https://eocipinztulbhkjufrkn.supabase.co';

function getPublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.DOMIVISE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  );
}

module.exports = function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.status(200).json({
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DOMIVISE_SUPABASE_URL || SUPABASE_URL,
    publishableKey: getPublishableKey()
  });
};
