(function () {
  'use strict';

  window.DOMIVISE_SUPABASE_CONFIG = {
    url: 'https://eocipinztulbhkjufrkn.supabase.co',
    publishableKey: ''
  };

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

  window.DOMIVISE_SUPABASE_CONFIG_READY = window.fetch('/api/supabase-config', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('config_unavailable');
      return response.json();
    })
    .then(function (config) {
      window.DOMIVISE_SUPABASE_CONFIG = Object.assign({}, window.DOMIVISE_SUPABASE_CONFIG, config || {});
      window.DOMIVISE_SUPABASE_CONFIG.url = clean(window.DOMIVISE_SUPABASE_CONFIG.url);
      window.DOMIVISE_SUPABASE_CONFIG.publishableKey = clean(window.DOMIVISE_SUPABASE_CONFIG.publishableKey);
      return window.DOMIVISE_SUPABASE_CONFIG;
    })
    .catch(function () {
      return window.DOMIVISE_SUPABASE_CONFIG;
    });
})();
