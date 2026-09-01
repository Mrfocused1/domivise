(function () {
  'use strict';

  window.DOMIVISE_SUPABASE_CONFIG = {
    url: 'https://eocipinztulbhkjufrkn.supabase.co',
    publishableKey: ''
  };

  window.DOMIVISE_SUPABASE_CONFIG_READY = window.fetch('/api/supabase-config', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('config_unavailable');
      return response.json();
    })
    .then(function (config) {
      window.DOMIVISE_SUPABASE_CONFIG = Object.assign({}, window.DOMIVISE_SUPABASE_CONFIG, config || {});
      return window.DOMIVISE_SUPABASE_CONFIG;
    })
    .catch(function () {
      return window.DOMIVISE_SUPABASE_CONFIG;
    });
})();
