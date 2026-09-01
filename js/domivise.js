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
            showSuccess();
          })
          .catch(function () {
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
})();
