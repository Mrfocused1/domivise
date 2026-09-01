(function () {
  'use strict';

  var CONFIG = {
    formEndpoint: (window.domiviseContent && window.domiviseContent.site && window.domiviseContent.site.formEndpoint) || '/api/founding-100',
    foundingTaken: null,
    foundingTotal: 100
  };

  function syncContentConfig() {
    if (!window.domiviseContent || !window.domiviseContent.site) return;
    CONFIG.formEndpoint = window.domiviseContent.site.formEndpoint || '/api/founding-100';
  }

  window.addEventListener('domivise-content:updated', syncContentConfig);

  var ANALYTICS_VISITOR_KEY = 'domivise-analytics-visitor-v1';
  var ANALYTICS_SESSION_KEY = 'domivise-analytics-session-v1';
  var analyticsStarted = false;
  var sessionId = getStoredId(ANALYTICS_SESSION_KEY, window.sessionStorage);
  var visitorId = getStoredId(ANALYTICS_VISITOR_KEY, window.localStorage);

  function isAdminPreview() {
    return window.location.search.indexOf('adminPreview=1') !== -1 || Boolean(document.body && document.body.classList.contains('admin-body'));
  }

  function analyticsConfig() {
    return window.DOMIVISE_SUPABASE_CONFIG || {};
  }

  function isAnalyticsConfigured() {
    var config = analyticsConfig();
    return Boolean(config.url && config.publishableKey && config.publishableKey.indexOf('replace-') !== 0);
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function (char) {
        return (Number(char) ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(char) / 4).toString(16);
      });
    }
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function (char) {
      var value = Math.floor(Math.random() * 16);
      return (Number(char) ^ value & 15 >> Number(char) / 4).toString(16);
    });
  }

  function getStoredId(key, store) {
    try {
      var saved = store && store.getItem(key);
      if (saved) return saved;
      var next = createId();
      if (store) store.setItem(key, next);
      return next;
    } catch (error) {
      return createId();
    }
  }

  function cleanAnalyticsText(value, maxLength) {
    return String(value == null ? '' : value).trim().slice(0, maxLength);
  }

  function referrerHost() {
    if (!document.referrer) return null;
    try {
      var url = new URL(document.referrer);
      return url.hostname === window.location.hostname ? null : url.hostname.slice(0, 180);
    } catch (error) {
      return null;
    }
  }

  function querySource() {
    var params = new URLSearchParams(window.location.search);
    return cleanAnalyticsText(params.get('utm_source') || params.get('source') || params.get('ref') || '', 120);
  }

  function inferSource(eventName, metadata) {
    if (metadata.source) return cleanAnalyticsText(metadata.source, 120);
    var campaignSource = querySource();
    if (campaignSource) return campaignSource;
    var host = referrerHost();
    if (host) return host;
    if (eventName === 'form_submit_attempt' || eventName === 'form_submit_success' || eventName === 'form_submit_error' || eventName === 'form_validation_failed') {
      var field = document.getElementById('sourceField');
      if (field && field.value) return cleanAnalyticsText(field.value, 120);
    }
    return 'direct';
  }

  function analyticsHeaders() {
    var config = analyticsConfig();
    return {
      apikey: config.publishableKey,
      Authorization: 'Bearer ' + config.publishableKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    };
  }

  function trackAnalytics(eventName, metadata) {
    if (isAdminPreview() || !window.fetch || !isAnalyticsConfigured()) return;
    metadata = metadata && typeof metadata === 'object' ? metadata : {};
    var source = inferSource(eventName, metadata);
    var event = {
      event_name: cleanAnalyticsText(eventName, 64),
      page_path: cleanAnalyticsText(window.location.pathname + window.location.search, 300) || '/',
      source: source || null,
      referrer_host: referrerHost(),
      visitor_id: visitorId,
      session_id: sessionId,
      metadata: metadata
    };
    var config = analyticsConfig();
    fetch(config.url.replace(/\/$/, '') + '/rest/v1/site_analytics_events', {
      method: 'POST',
      headers: analyticsHeaders(),
      body: JSON.stringify(event),
      keepalive: true
    }).catch(function () {});
  }

  function linkAnalyticsLabel(link) {
    var label = link.querySelector('.btn_label:not(.is-duplicate)');
    return cleanAnalyticsText((label || link).textContent, 140);
  }

  function startAnalytics() {
    if (analyticsStarted || isAdminPreview()) return;
    analyticsStarted = true;
    trackAnalytics('page_view', {
      title: document.title,
      width: window.innerWidth,
      height: window.innerHeight
    });

    document.querySelectorAll('a[href="#join"]').forEach(function (link) {
      link.addEventListener('click', function () {
        var section = link.closest('section');
        trackAnalytics('cta_click', {
          label: linkAnalyticsLabel(link),
          source: link.getAttribute('data-source') || (section && section.id) || 'landing-page'
        });
      });
    });

    if ('IntersectionObserver' in window) {
      var seenSections = {};
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || seenSections[entry.target.id]) return;
          seenSections[entry.target.id] = true;
          trackAnalytics('section_view', { section: entry.target.id });
        });
      }, { threshold: 0.45 });
      document.querySelectorAll('section[id]').forEach(function (section) {
        sectionObserver.observe(section);
      });
    }
  }

  window.DomiViseAnalytics = { track: trackAnalytics };

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -80 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      history.replaceState(null, '', id);
    });
  });

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reducedMotion) {
    var animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-live');
        var counter = entry.target.querySelector('[data-count]');
        if (counter) animateCount(counter);
        var arc = entry.target.querySelector('.dv-hc_arc');
        if (arc) arc.style.strokeDashoffset = '22';
        animObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('.dv-anim').forEach(function (el) { animObserver.observe(el); });
  } else {
    document.querySelectorAll('.dv-anim').forEach(function (el) { el.classList.add('is-live'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
    document.querySelectorAll('.dv-hc_arc').forEach(function (el) { el.style.strokeDashoffset = '22'; });
  }

  document.querySelectorAll('[data-source]').forEach(function (el) {
    el.addEventListener('click', function () {
      var field = document.getElementById('sourceField');
      if (field) field.value = el.getAttribute('data-source');
    });
  });

  var form = document.getElementById('joinForm');
  var success = document.getElementById('joinSuccess');
  var submitBtn = document.getElementById('submitBtn');
  var formStatus = document.getElementById('formStatus');
  var submitDefaultLabelEl = submitBtn ? submitBtn.querySelector('.btn_label:not(.is-duplicate)') : null;
  var submitDefaultDuplicateLabelEl = submitBtn ? submitBtn.querySelector('.btn_label.is-duplicate') : null;
  var submitDefaultLabel = submitDefaultLabelEl ? submitDefaultLabelEl.textContent : '';
  var submitDefaultDuplicateLabel = submitDefaultDuplicateLabelEl ? submitDefaultDuplicateLabelEl.textContent : '';

  function setSubmitLabel(label) {
    if (!submitBtn) return;
    submitBtn.querySelectorAll('.btn_label').forEach(function (el) {
      el.textContent = label;
    });
  }

  function setFormStatus(message) {
    if (formStatus) formStatus.textContent = message || '';
  }

  function mark(input, bad) {
    input.style.borderColor = bad ? '#b3261e' : '';
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  function validate() {
    var ok = true;
    ['fld-name', 'fld-email', 'fld-size'].forEach(function (id) {
      var input = document.getElementById(id);
      var valid = id === 'fld-email'
        ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())
        : Boolean(input.value);
      mark(input, !valid);
      if (!valid && ok) {
        input.focus();
        ok = false;
      } else if (!valid) {
        ok = false;
      }
    });
    form.classList.toggle('is-error', !ok);
    if (!ok) trackAnalytics('form_validation_failed', {
      source: document.getElementById('sourceField') && document.getElementById('sourceField').value || 'landing-page'
    });
    return ok;
  }

  ['fld-name', 'fld-email', 'fld-size'].forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    ['input', 'change'].forEach(function (evt) {
      input.addEventListener(evt, function () {
        mark(input, false);
        form.classList.remove('is-error');
      });
    });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      var hp = form.querySelector('.dv-hp');
      if (hp && hp.value) {
        form.hidden = true;
        success.hidden = false;
        return;
      }

      var data = new FormData(form);
      var payload = Object.fromEntries(data.entries());
      if (!payload['Marketing-Consent']) payload['Marketing-Consent'] = 'no';
      trackAnalytics('form_submit_attempt', {
        source: payload.Source || 'landing-page',
        portfolioSize: payload['Portfolio-Size'] || '',
        marketingConsent: payload['Marketing-Consent'] === 'yes' ? 'yes' : 'no'
      });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.setAttribute('aria-busy', 'true');
        setSubmitLabel('Sending...');
      }
      setFormStatus('Sending your application...');
      syncContentConfig();

      if (CONFIG.formEndpoint) {
        fetch(CONFIG.formEndpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        })
          .then(function (res) {
            if (!res.ok) throw new Error('failed');
            trackAnalytics('form_submit_success', {
              source: payload.Source || 'landing-page',
              portfolioSize: payload['Portfolio-Size'] || '',
              marketingConsent: payload['Marketing-Consent'] === 'yes' ? 'yes' : 'no'
            });
            showSuccess();
          })
          .catch(function () {
            trackAnalytics('form_submit_error', {
              source: payload.Source || 'landing-page',
              portfolioSize: payload['Portfolio-Size'] || ''
            });
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.style.opacity = '';
              submitBtn.removeAttribute('aria-busy');
              setSubmitLabel(submitDefaultLabel || submitDefaultDuplicateLabel || 'Apply to join the Founding 100');
            }
            setFormStatus('');
            var contactEmail = (window.domiviseContent && window.domiviseContent.site && window.domiviseContent.site.contactEmail) || 'hello@domivise.co.uk';
            alert("Something went wrong. Please try again, or email " + contactEmail + " directly.");
          });
      } else {
        setTimeout(showSuccess, 400);
      }
    });
  }

  function showSuccess() {
    if (submitBtn) {
      submitBtn.removeAttribute('aria-busy');
      setSubmitLabel('Application received');
    }
    setFormStatus('Application received. Confirmation email sent.');
    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
    if (window.lenis) window.lenis.scrollTo(success, { offset: -120 });
    else success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (window.DomiViseContent && typeof window.DomiViseContent.ensureConfig === 'function') {
    window.DomiViseContent.ensureConfig().then(startAnalytics);
  } else {
    startAnalytics();
  }
})();
