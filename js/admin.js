(function () {
  'use strict';

  var model = window.DomiViseContent;
  if (!model) return;

  var AUTH_SESSION_KEY = 'domivise-admin-session-v1';
  var content = model.loadLocal();
  var editor = document.getElementById('editorMount');
  var preview = document.getElementById('sitePreview');
  var saveState = document.getElementById('saveState');
  var notifications = document.getElementById('adminNotifications');
  var connectionState = document.getElementById('adminConnectionState');
  var analyticsMount = document.getElementById('analyticsMount');
  var overview = document.getElementById('overview');
  var authPanel = document.createElement('section');
  var saveTimer;
  var session = loadStoredSession();
  var currentUser = null;
  var remoteUnavailable = true;

  authPanel.className = 'admin-auth-panel';

  function getConfig() {
    return window.DOMIVISE_SUPABASE_CONFIG || {};
  }

  var GROUPS = [
    {
      id: 'hero', number: '01', title: 'Top section', description: 'Edit the first thing visitors see on the homepage.',
      fields: [
        ['hero.eyebrow', 'Small heading', 'text'],
        ['hero.title', 'Main headline', 'textarea'],
        ['hero.strapline', 'Text under the headline', 'textarea'],
        ['hero.description', 'Intro paragraph', 'textarea'],
        ['hero.scope', 'UK coverage line', 'textarea'],
        ['hero.primaryCta', 'Main button text', 'text'],
        ['hero.secondaryCta', 'Second button text', 'text'],
        ['hero.bullets', 'Trust points', 'list'],
        ['hero.mediaTag', 'Image label', 'text'],
        ['hero.cardCaption', 'Image caption', 'text'],
        ['hero.statValue', 'Score number', 'text'],
        ['hero.statLabel', 'Score wording', 'textarea-short']
      ]
    },
    {
      id: 'product', number: '02', title: 'App preview', description: 'Edit the example dashboard shown on the page.',
      fields: [
        ['product.eyebrow', 'Small heading', 'text'],
        ['product.proposition', 'Short promise', 'text'],
        ['product.heading', 'Heading', 'textarea'],
        ['product.bodyOne', 'First paragraph', 'textarea'],
        ['product.bodyTwo', 'Second paragraph', 'textarea'],
        ['product.previewLabel', 'Small note above preview', 'text'],
        ['product.sampleName', 'Greeting name', 'text'],
        ['product.samplePortfolio', 'Portfolio line', 'text'],
        ['product.sampleBadge', 'Badge text', 'text'],
        ['product.scoreValue', 'Health score', 'text'],
        ['product.scoreTitle', 'Score title', 'text'],
        ['product.scoreStatus', 'Score message', 'text'],
        ['product.tip', 'Tip text', 'textarea'],
        { path: 'product.rows', label: 'Dashboard cards', type: 'object-list', fields: [['title', 'Top line'], ['detail', 'Small line'], ['pill', 'Badge']] }
      ]
    },
    {
      id: 'sections', number: '03', title: 'Page sections', description: 'Edit the main blocks visitors read as they scroll.',
      fields: [
        { path: 'difference', label: 'Problem and solution', type: 'object', fields: [['heading', 'Heading'], ['rightNow', 'Current problems', 'list'], ['withDomiVise', 'How DomiVise helps', 'list']] },
        { path: 'features', label: 'What DomiVise helps with', type: 'object', fields: [['eyebrow', 'Small heading'], ['heading', 'Heading'], ['intro', 'Intro paragraph'], ['cards', 'Help cards', 'object-list', [['title', 'Card title'], ['body', 'Card text']]]] },
        { path: 'testimonial', label: 'Founder quote', type: 'object', fields: [['quote', 'Quote'], ['author', 'Author'], ['role', 'Job title']] },
        { path: 'founding', label: 'Founding 100', type: 'object', fields: [['label', 'Small heading'], ['heading', 'Heading'], ['intro', 'Intro paragraph'], ['limit', 'Places message'], ['benefits', 'Benefits', 'object-list', [['title', 'Benefit title'], ['body', 'Benefit text']]], ['cta', 'Button text'], ['note', 'Small note']] },
        { path: 'health', label: 'Health check', type: 'object', fields: [['label', 'Small heading'], ['heading', 'Heading'], ['body', 'Paragraph'], ['chips', 'Topics'], ['meta', 'Small details line'], ['cta', 'Button text'], ['note', 'Small note'], ['score', 'Example score'], ['caption', 'Score caption']] },
        { path: 'trust', label: 'Trust section', type: 'object', fields: [['statusLabel', 'Small heading'], ['statusBody', 'Status message'], ['whyLabel', 'Trust heading'], ['whyBody', 'Trust paragraph'], ['cards', 'Trust cards', 'object-list', [['title', 'Card title'], ['body', 'Card text']]]] }]
    },
    {
      id: 'forms', number: '04', title: 'Form and emails', description: 'Edit the signup form and the emails people receive after applying.',
      fields: [
        ['join.eyebrow', 'Small heading', 'text'],
        ['join.heading', 'Form heading', 'textarea'],
        ['join.body', 'Intro paragraph', 'textarea'],
        ['join.bullets', 'Benefits next to the form', 'list'],
        ['join.nameLabel', 'Name label', 'text'],
        ['join.namePlaceholder', 'Name placeholder', 'text'],
        ['join.emailLabel', 'Email label', 'text'],
        ['join.emailPlaceholder', 'Email placeholder', 'text'],
        ['join.portfolioLabel', 'Property count label', 'text'],
        ['join.portfolioPlaceholder', 'Property count prompt', 'text'],
        ['join.challengeLabel', 'Challenge label', 'text'],
        ['join.challengePlaceholder', 'Challenge placeholder', 'text'],
        ['join.consentNote', 'Required email note', 'textarea'],
        ['join.marketingConsent', 'Marketing checkbox text', 'textarea'],
        ['join.submit', 'Submit button', 'text'],
        ['join.finePrint', 'Privacy line', 'textarea'],
        ['join.successHeading', 'Thank-you heading', 'text'],
        ['join.successBody', 'Thank-you message', 'textarea'],
        ['join.successContactLabel', 'Contact line before email', 'text'],
        ['site.contactEmail', 'Public contact email', 'email'],
        ['email.applicantSubject', 'Email subject for applicants', 'text'],
        ['email.applicantHeading', 'Email heading for applicants', 'text'],
        ['email.applicantGreeting', 'Email greeting', 'text'],
        ['email.applicantBody', 'Email message for applicants', 'textarea'],
        ['email.applicantSignature', 'Email sign-off', 'textarea'],
        ['email.notificationSubject', 'Email subject for you', 'text'],
        ['email.notificationHeading', 'Email heading for you', 'text'],
        ['email.notificationIntro', 'Short note for you', 'textarea'],
        { path: 'faq', label: 'Questions and answers', type: 'object', fields: [['eyebrow', 'Small heading'], ['heading', 'Heading'], ['note', 'Intro paragraph'], ['items', 'Questions and answers', 'object-list', [['question', 'Question'], ['answer', 'Answer']]]] }
      ]
    },
    {
      id: 'media', number: '05', title: 'Images and footer', description: 'Upload page images and edit the footer text and social links.',
      fields: [
        ['hero.backgroundImage', 'Hero background image', 'image'],
        ['hero.videoPoster', 'Hero video image', 'image'],
        ['hero.cardImage', 'Hero card image', 'image'],
        ['testimonial.image', 'Testimonial image', 'image'],
        ['faq.imageOne', 'FAQ image one', 'image'],
        ['faq.imageTwo', 'FAQ image two', 'image'],
        ['site.instagram', 'Instagram link', 'url'],
        ['site.linkedin', 'LinkedIn link', 'url'],
        ['site.footerContactLabel', 'Footer contact heading', 'text'],
        ['site.footerCompanyDetails', 'Company details', 'textarea'],
        ['site.footerCredentialOne', 'First footer note', 'textarea'],
        ['site.footerCredentialTwo', 'Second footer note', 'textarea'],
        ['site.footerCredentialThree', 'Third footer note', 'textarea'],
        ['site.footerCredit', 'Footer credit line', 'text'],
        ['site.footerTagline', 'Large footer tagline', 'text'],
        ['site.copyright', 'Copyright line', 'text'],
        ['site.logoHomeLabel', 'Logo link label', 'text']
      ]
    }
  ];

  function get(object, path) {
    return path.split('.').reduce(function (value, key) { return value == null ? undefined : value[key]; }, object);
  }

  function set(object, path, value) {
    var parts = path.split('.');
    var cursor = object;
    parts.slice(0, -1).forEach(function (part, index) {
      if (cursor[part] == null) cursor[part] = /^\d+$/.test(parts[index + 1]) ? [] : {};
      cursor = cursor[part];
    });
    cursor[parts[parts.length - 1]] = value;
  }

  function labelFor(path, fallback) {
    return fallback || path.split('.').pop().replace(/([A-Z])/g, ' $1').replace(/^./, function (char) { return char.toUpperCase(); });
  }

  function inputMarkup(path, label, type, value, upload) {
    var id = 'field-' + path.replace(/[^a-z0-9]/gi, '-');
    var control;
    if (type === 'image') {
      control = '<label class="admin-upload admin-upload-only" for="' + id + '">Upload<input id="' + id + '" type="file" accept="image/*" data-upload-path="' + path + '" /></label>';
    } else if (type === 'textarea' || type === 'textarea-short') {
      control = '<textarea class="admin-control ' + (type === 'textarea-short' ? 'admin-short' : '') + '" id="' + id + '" data-path="' + path + '" rows="' + (type === 'textarea-short' ? '2' : '4') + '">' + escapeHtml(value) + '</textarea>';
    } else {
      var inputType = type === 'email' ? 'email' : type === 'url' ? 'url' : 'text';
      control = '<input class="admin-control" id="' + id + '" data-path="' + path + '" type="' + inputType + '" value="' + escapeAttr(value) + '" />';
    }
    if (upload && type !== 'image') {
      control = '<div class="admin-image-row">' + control + '<label class="admin-upload">Upload<input type="file" accept="image/*" data-upload-path="' + path + '" /></label></div>';
    }
    return '<div class="admin-field"><label for="' + id + '">' + escapeHtml(labelFor(path, label)) + '</label>' + control + (type === 'image' ? '<small>Choose an image file to update the live preview.</small>' : '') + '</div>';
  }

  function renderList(path, label, values) {
    values = Array.isArray(values) ? values : [];
    return '<div class="admin-field"><label>' + escapeHtml(label) + '</label><div class="admin-repeat-list" data-list-path="' + path + '">' + values.map(function (value, index) {
      var id = 'list-' + path.replace(/[^a-z0-9]/gi, '-') + '-' + index;
      return '<div class="admin-repeat"><div class="admin-repeat-head"><span>Item ' + String(index + 1).padStart(2, '0') + '</span></div><textarea class="admin-control" id="' + id + '" data-list-item="' + path + '" data-list-index="' + index + '" rows="2">' + escapeHtml(value) + '</textarea></div>';
    }).join('') + '</div></div>';
  }

  function renderObject(path, label, fields) {
    var html = '<div class="admin-subgroup"><div class="admin-repeat-head"><span>' + escapeHtml(label) + '</span></div><div class="admin-fields admin-fields-nested">';
    fields.forEach(function (field) {
      var childPath = path + '.' + field[0];
      var childValue = get(content, childPath);
      if (field[2] === 'list') html += renderList(childPath, field[1], childValue);
      else if (field[2] === 'object-list') html += renderObjectList(childPath, field[1], field[3], childValue);
      else html += inputMarkup(childPath, field[1], field[2] === 'textarea' ? 'textarea' : 'text', childValue == null ? '' : childValue, false);
    });
    return html + '</div></div>';
  }

  function renderObjectList(path, label, fields, values) {
    values = Array.isArray(values) ? values : [];
    return '<div class="admin-field"><label>' + escapeHtml(label) + '</label>' + values.map(function (item, index) {
      return '<div class="admin-repeat"><div class="admin-repeat-head"><span>Item ' + String(index + 1).padStart(2, '0') + '</span></div><div class="admin-repeat-grid">' + fields.map(function (field) {
        var childPath = path + '.' + index + '.' + field[0];
        var childValue = item[field[0]] == null ? '' : item[field[0]];
        return inputMarkup(childPath, field[1], 'textarea', childValue, false);
      }).join('') + '</div></div>';
    }).join('') + '</div>';
  }

  function render() {
    editor.innerHTML = GROUPS.map(function (group) {
      var fields = group.fields.map(function (field) {
        if (field.path) {
          var value = get(content, field.path);
          if (field.type === 'list') return renderList(field.path, field.label, value);
          if (field.type === 'object-list') return renderObjectList(field.path, field.label, field.fields, value);
          if (field.type === 'object') return renderObject(field.path, field.label, field.fields);
          return inputMarkup(field.path, field.label, field.type, value == null ? '' : value, field.type === 'image');
        }
        var value = get(content, field[0]);
        if (field[2] === 'list') return renderList(field[0], field[1], value);
        return inputMarkup(field[0], field[1], field[2], value == null ? '' : value, field[2] === 'image');
      }).join('');
      return '<section class="admin-card" id="' + group.id + '"><div class="admin-card-head"><div><h2>' + escapeHtml(group.title) + '</h2><p>' + escapeHtml(group.description) + '</p></div><span class="admin-card-number">' + group.number + '</span></div><div class="admin-fields">' + fields + '</div></section>';
    }).join('');
    bindFields();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function setStatus(message, saved) {
    saveState.textContent = message;
    saveState.classList.toggle('is-saved', Boolean(saved));
  }

  function setLocked(locked) {
    document.body.classList.toggle('is-auth-locked', Boolean(locked));
  }

  function setHeader(title, overline) {
    var heading = document.querySelector('.admin-topbar h1');
    var label = document.querySelector('.admin-topbar .admin-overline');
    if (heading) heading.textContent = title;
    if (label) label.textContent = overline;
  }

  function showLoginView(title) {
    setLocked(true);
    setHeader(title || 'Sign in', '');
    if (editor) editor.innerHTML = '';
  }

  function showPasswordResetView(message) {
    setLocked(true);
    setHeader('Set a new password', '');
    if (!authPanel.isConnected) {
      var topbar = document.querySelector('.admin-topbar');
      if (overview) overview.insertAdjacentElement('afterend', authPanel);
      else if (topbar) topbar.insertAdjacentElement('afterend', authPanel);
    }
    if (editor) editor.innerHTML = '';
    authPanel.innerHTML = [
      '<form class="admin-login admin-password-reset" id="passwordResetForm">',
      '<div><strong>Choose a new password</strong><p>' + escapeHtml(message || 'Enter a new password for your DomiVise admin account.') + '</p></div>',
      '<label><span class="admin-sr-only">New password</span><input class="admin-control" name="password" type="password" required minlength="8" autocomplete="new-password" aria-label="New password" placeholder="New password" /></label>',
      '<label><span class="admin-sr-only">Confirm password</span><input class="admin-control" name="confirm" type="password" required minlength="8" autocomplete="new-password" aria-label="Confirm password" placeholder="Confirm password" /></label>',
      '<button class="admin-button admin-button-primary" type="submit">Update password</button>',
      '</form>'
    ].join('');

    document.getElementById('passwordResetForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var password = form.password.value;
      var confirm = form.confirm.value;
      if (password.length < 8) {
        setStatus('Use at least 8 characters', false);
        return;
      }
      if (password !== confirm) {
        setStatus('Passwords do not match', false);
        return;
      }

      setStatus('Updating password...', false);
      updatePassword(password)
        .then(fetchUser)
        .then(function (user) {
          if (!isAdminUser(user)) {
            storeSession(null);
            currentUser = null;
            renderAuthPanel();
            setStatus('Password updated, but this account cannot publish.', false);
            notify('Password updated', 'Sign in with an admin account to publish homepage changes.', 'warning');
            return null;
          }
          setStatus('Password updated', true);
          notify('Password updated', 'You are signed in with your new password.', 'success');
          renderAuthPanel();
          return loadInitialContent();
        })
        .catch(function () {
          setStatus('Could not update password', false);
          notify('Password reset failed', 'The reset link may have expired. Request a new reset link and try again.', 'error');
        });
    });
  }

  function showEditorView() {
    setLocked(false);
    setHeader('Edit your homepage.', 'DomiVise editor');
  }

  function ensurePreviewLoaded() {
    if (!preview || preview.getAttribute('src')) return;
    var src = preview.getAttribute('data-src');
    if (src) preview.setAttribute('src', src);
  }

  function notify(title, message, tone) {
    if (!notifications) return;
    var notice = document.createElement('div');
    notice.className = 'admin-toast admin-toast-' + (tone || 'success');
    notice.innerHTML = '<strong>' + escapeHtml(title) + '</strong>' + escapeHtml(message || '');
    notifications.replaceChildren(notice);
    clearTimeout(notify.timer);
    notify.timer = setTimeout(function () {
      if (notice.isConnected) notice.remove();
    }, 5000);
  }

  function setDirty() {
    setStatus('Changes not saved yet', false);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      setStatus(remoteUnavailable ? 'Ready to save in this browser' : 'Ready to publish', false);
    }, 800);
  }

  function update(path, value) {
    set(content, path, value);
    setDirty();
    postPreview();
  }

  function analyticsSummaryUrl() {
    return authUrl('/rest/v1/rpc/site_analytics_summary');
  }

  function analyticsQueryUrl(days) {
    var since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();
    return authUrl('/rest/v1/site_analytics_events?select=created_at,event_name,page_path,source,referrer_host,visitor_id,session_id,metadata&created_at=gte.' + encodeURIComponent(since) + '&order=created_at.desc&limit=20');
  }

  function loadAnalytics() {
    if (!analyticsMount || !model.isSupabaseConfigured() || !isAdminUser(currentUser)) return Promise.resolve();
    analyticsMount.innerHTML = '<div class="admin-analytics-loading">Loading analytics...</div>';
    return ensureSession().then(function (activeSession) {
      if (!activeSession) throw new Error('session_required');
      var headers = authHeaders(activeSession.access_token);
      return Promise.all([
        fetch(analyticsSummaryUrl(), {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ days_back: 30 })
        }),
        fetch(analyticsQueryUrl(30), { headers: headers })
      ]);
    }).then(function (responses) {
      if (!responses[0].ok || !responses[1].ok) {
        var error = new Error('analytics_unavailable');
        error.status = responses[0].ok ? responses[1].status : responses[0].status;
        throw error;
      }
      return Promise.all([responses[0].json(), responses[1].json()]);
    }).then(function (payload) {
      var summary = normalizeSummary(payload[0]);
      var events = Array.isArray(payload[1]) ? payload[1] : [];
      renderAnalytics(summary, events);
    }).catch(function (error) {
      renderAnalyticsError(error);
    });
  }

  function renderAnalytics(summary, events) {
    if (!analyticsMount) return;
    summary = summary || summarizeAnalytics(events);
    summary.recent = events.slice(0, 12);
    analyticsMount.innerHTML = [
      '<div class="admin-analytics-head">',
      '<div><p class="admin-overline">Analytics</p><h2>What is happening</h2><p>Last 30 days. Recent activity shows the latest ' + events.length + ' tracked events.</p></div>',
      '<button class="admin-button admin-button-quiet" id="refreshAnalyticsBtn" type="button">Refresh</button>',
      '</div>',
      '<div class="admin-metrics">',
      metricMarkup('Visitors', summary.visitors),
      metricMarkup('Sessions', summary.sessions),
      metricMarkup('Page views', summary.pageViews),
      metricMarkup('CTA clicks', summary.ctaClicks),
      metricMarkup('Applications', summary.applications),
      metricMarkup('Conversion', summary.conversion),
      metricMarkup('Errors', summary.errorsTotal),
      '</div>',
      '<div class="admin-analytics-layout">',
      analyticsBlock('Daily trend', trendMarkup(summary.daily)),
      analyticsBlock('Form funnel', funnelMarkup(summary.funnel)),
      analyticsBlock('Top sources', barListMarkup(summary.sources, 'No traffic sources yet.')),
      analyticsBlock('CTA clicks', barListMarkup(summary.ctas, 'No CTA clicks yet.')),
      analyticsBlock('Section views', barListMarkup(summary.sections, 'No section views yet.')),
      analyticsBlock('Portfolio sizes', barListMarkup(summary.portfolioSizes, 'No application portfolio data yet.')),
      analyticsBlock('Marketing consent', barListMarkup(summary.marketingConsent, 'No application consent data yet.')),
      analyticsBlock('Errors', barListMarkup(summary.errors, 'No form errors tracked yet.')),
      analyticsBlock('Recent activity', activityMarkup(summary.recent)),
      '</div>'
    ].join('');
    bindAnalyticsRefresh();
  }

  function renderAnalyticsError(error) {
    if (!analyticsMount) return;
    var message = error && (error.status === 404 || error.status === 401 || error.status === 403)
      ? 'Analytics is not ready yet. Apply the Supabase schema update so the admin account can read site_analytics_events.'
      : 'Analytics could not be loaded. Check the Supabase connection and try again.';
    analyticsMount.innerHTML = [
      '<div class="admin-analytics-head">',
      '<div><p class="admin-overline">Analytics</p><h2>What is happening</h2><p>' + escapeHtml(message) + '</p></div>',
      '<button class="admin-button admin-button-quiet" id="refreshAnalyticsBtn" type="button">Retry</button>',
      '</div>'
    ].join('');
    bindAnalyticsRefresh();
  }

  function bindAnalyticsRefresh() {
    var refresh = document.getElementById('refreshAnalyticsBtn');
    if (refresh) refresh.addEventListener('click', loadAnalytics);
  }

  function metricMarkup(label, value) {
    return '<div class="admin-metric"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
  }

  function analyticsBlock(title, body) {
    return '<section class="admin-analytics-block"><h3>' + escapeHtml(title) + '</h3>' + body + '</section>';
  }

  function normalizeSummary(summary) {
    summary = summary && typeof summary === 'object' ? summary : {};
    return {
      visitors: Number(summary.visitors || 0),
      sessions: Number(summary.sessions || 0),
      pageViews: Number(summary.pageViews || 0),
      ctaClicks: Number(summary.ctaClicks || 0),
      formAttempts: Number(summary.formAttempts || 0),
      applications: Number(summary.applications || 0),
      conversion: formatPercent(summary.conversion || 0),
      errorsTotal: Number(summary.errorsTotal || 0),
      daily: normalizeItems(summary.daily),
      funnel: normalizeItems(summary.funnel),
      sources: normalizeItems(summary.sources),
      ctas: normalizeItems(summary.ctas),
      sections: normalizeItems(summary.sections),
      portfolioSizes: normalizeItems(summary.portfolioSizes),
      marketingConsent: normalizeItems(summary.marketingConsent),
      errors: normalizeItems(summary.errors),
      recent: []
    };
  }

  function normalizeItems(items) {
    return Array.isArray(items) ? items : [];
  }

  function summarizeAnalytics(events) {
    var visitors = {};
    var sessions = {};
    var counts = {};
    var sources = {};
    var ctas = {};
    var sections = {};
    var portfolioSizes = {};
    var marketingConsent = {};
    var errors = {};
    var daily = {};
    var recent = events.slice(0, 12);

    events.forEach(function (event) {
      var day = event.created_at ? event.created_at.slice(0, 10) : '';
      if (day && !daily[day]) daily[day] = { date: day, pageViews: 0, ctaClicks: 0, applications: 0 };
      if (event.visitor_id) visitors[event.visitor_id] = true;
      if (event.session_id) sessions[event.session_id] = true;
      counts[event.event_name] = (counts[event.event_name] || 0) + 1;
      if (event.event_name === 'page_view') {
        addCount(sources, event.source || event.referrer_host || 'direct');
        if (day) daily[day].pageViews += 1;
      }
      if (event.event_name === 'cta_click') {
        addCount(ctas, cleanLabel((event.metadata && event.metadata.label) || event.source || 'CTA'));
        if (day) daily[day].ctaClicks += 1;
      }
      if (event.event_name === 'section_view') {
        addCount(sections, cleanLabel((event.metadata && event.metadata.section) || 'section'));
      }
      if (event.event_name === 'form_submit_success') {
        addCount(portfolioSizes, cleanLabel(event.metadata && event.metadata.portfolioSize || 'Not supplied'));
        addCount(marketingConsent, event.metadata && event.metadata.marketingConsent === 'yes' ? 'Yes' : 'No');
        if (day) daily[day].applications += 1;
      }
      if (event.event_name === 'form_validation_failed' || event.event_name === 'form_submit_error') {
        addCount(errors, event.event_name);
      }
    });

    var pageViews = counts.page_view || 0;
    var applications = counts.form_submit_success || 0;
    var ctaClicks = counts.cta_click || 0;
    var formAttempts = counts.form_submit_attempt || 0;
    var errorsTotal = (counts.form_validation_failed || 0) + (counts.form_submit_error || 0);
    return {
      visitors: Object.keys(visitors).length,
      sessions: Object.keys(sessions).length,
      pageViews: pageViews,
      ctaClicks: ctaClicks,
      formAttempts: formAttempts,
      applications: applications,
      conversion: pageViews ? formatPercent(Math.round((applications / pageViews) * 1000) / 10) : '0%',
      errorsTotal: errorsTotal,
      funnel: [
        { label: 'Page views', value: pageViews },
        { label: 'CTA clicks', value: ctaClicks },
        { label: 'Form attempts', value: formAttempts },
        { label: 'Applications', value: applications }
      ],
      daily: Object.keys(daily).sort().map(function (key) { return daily[key]; }),
      sources: rankedCounts(sources),
      ctas: rankedCounts(ctas),
      sections: rankedCounts(sections),
      portfolioSizes: rankedCounts(portfolioSizes),
      marketingConsent: rankedCounts(marketingConsent),
      errors: rankedCounts(errors),
      recent: recent
    };
  }

  function addCount(target, key) {
    key = cleanLabel(key || 'unknown');
    target[key] = (target[key] || 0) + 1;
  }

  function cleanLabel(value) {
    return String(value || 'unknown').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'unknown';
  }

  function formatPercent(value) {
    var number = Number(value || 0);
    return (Math.round(number * 10) / 10) + '%';
  }

  function rankedCounts(counts) {
    return Object.keys(counts).map(function (key) {
      return { label: key, value: counts[key] };
    }).sort(function (a, b) {
      return b.value - a.value || a.label.localeCompare(b.label);
    }).slice(0, 8);
  }

  function trendMarkup(items) {
    items = normalizeItems(items);
    if (!items.length) return '<p class="admin-analytics-empty">No daily analytics yet.</p>';
    var max = items.reduce(function (largest, item) {
      return Math.max(largest, Number(item.pageViews || 0), Number(item.ctaClicks || 0), Number(item.applications || 0));
    }, 1);
    return '<div class="admin-trend">' + items.map(function (item) {
      var pageWidth = Math.max(0, Math.round((Number(item.pageViews || 0) / max) * 100));
      var ctaWidth = Math.max(0, Math.round((Number(item.ctaClicks || 0) / max) * 100));
      var appWidth = Math.max(0, Math.round((Number(item.applications || 0) / max) * 100));
      return '<div class="admin-trend-row"><time>' + escapeHtml(formatShortDate(item.date)) + '</time><div class="admin-trend-bars"><i class="is-page" style="width:' + pageWidth + '%"></i><i class="is-cta" style="width:' + ctaWidth + '%"></i><i class="is-application" style="width:' + appWidth + '%"></i></div><span>' + escapeHtml(Number(item.pageViews || 0)) + '</span></div>';
    }).join('') + '</div><div class="admin-trend-key"><span><i class="is-page"></i>Views</span><span><i class="is-cta"></i>CTAs</span><span><i class="is-application"></i>Applications</span></div>';
  }

  function funnelMarkup(items) {
    items = normalizeItems(items);
    if (!items.length) return '<p class="admin-analytics-empty">No funnel data yet.</p>';
    var max = items.reduce(function (largest, item) { return Math.max(largest, Number(item.value || 0)); }, 1);
    return '<div class="admin-funnel">' + items.map(function (item) {
      var width = Math.max(Number(item.value || 0) ? 8 : 0, Math.round((Number(item.value || 0) / max) * 100));
      return '<div class="admin-funnel-row"><div><span>' + escapeHtml(item.label) + '</span><strong>' + escapeHtml(Number(item.value || 0)) + '</strong></div><i style="width:' + width + '%"></i></div>';
    }).join('') + '</div>';
  }

  function barListMarkup(items, emptyText) {
    if (!items.length) return '<p class="admin-analytics-empty">' + escapeHtml(emptyText) + '</p>';
    var max = items[0].value || 1;
    return '<div class="admin-bars">' + items.map(function (item) {
      var width = Math.max(8, Math.round((item.value / max) * 100));
      return '<div class="admin-bar-row"><div><span>' + escapeHtml(item.label) + '</span><strong>' + escapeHtml(item.value) + '</strong></div><i style="width:' + width + '%"></i></div>';
    }).join('') + '</div>';
  }

  function activityMarkup(events) {
    if (!events.length) return '<p class="admin-analytics-empty">No events have been tracked yet.</p>';
    return '<div class="admin-activity">' + events.map(function (event) {
      return '<div class="admin-activity-row"><time>' + escapeHtml(formatDate(event.created_at)) + '</time><span>' + escapeHtml(activityText(event)) + '</span></div>';
    }).join('') + '</div>';
  }

  function activityText(event) {
    var metadata = event.metadata || {};
    if (event.event_name === 'page_view') return 'Page view from ' + cleanLabel(event.source || event.referrer_host || 'direct');
    if (event.event_name === 'cta_click') return 'CTA click: ' + cleanLabel(metadata.label || event.source || 'button');
    if (event.event_name === 'form_submit_success') return 'Application submitted from ' + cleanLabel(event.source || metadata.source || 'landing page');
    if (event.event_name === 'form_submit_attempt') return 'Application form started';
    if (event.event_name === 'form_submit_error') return 'Application submission error';
    if (event.event_name === 'form_validation_failed') return 'Form validation failed';
    if (event.event_name === 'section_view') return 'Viewed section: ' + cleanLabel(metadata.section || 'section');
    return cleanLabel(event.event_name);
  }

  function formatDate(value) {
    var date = new Date(value);
    if (!isFinite(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function formatShortDate(value) {
    var date = new Date(value);
    if (!isFinite(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  }

  function bindFields() {
    editor.querySelectorAll('[data-path]').forEach(function (input) {
      input.addEventListener('input', function () { update(input.getAttribute('data-path'), input.value); });
      input.addEventListener('change', function () { update(input.getAttribute('data-path'), input.value); });
    });
    editor.querySelectorAll('[data-list-item]').forEach(function (input) {
      input.addEventListener('input', function () {
        var array = get(content, input.getAttribute('data-list-item'));
        if (Array.isArray(array)) array[Number(input.getAttribute('data-list-index'))] = input.value;
        setDirty();
        postPreview();
      });
    });
    editor.querySelectorAll('[data-upload-path]').forEach(function (input) {
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var path = input.getAttribute('data-upload-path');
          update(path, reader.result);
          var target = editor.querySelector('[data-path="' + path + '"]');
          if (target) target.value = reader.result;
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function postPreview() {
    if (preview && preview.contentWindow) preview.contentWindow.postMessage({ type: 'domivise-content-preview', content: content }, '*');
  }

  function authUrl(path) {
    var config = getConfig();
    return config.url.replace(/\/$/, '') + path;
  }

  function recoveryRedirectUrl() {
    if (window.location.origin && window.location.origin !== 'null') {
      return window.location.origin + '/admin?recovery=1';
    }
    return window.location.href.split('#')[0].split('?')[0] + '?recovery=1';
  }

  function authHeaders(token) {
    var config = getConfig();
    var headers = {
      apikey: config.publishableKey,
      Authorization: 'Bearer ' + (token || config.publishableKey),
      'Content-Type': 'application/json'
    };
    return headers;
  }

  function normalizeSession(payload) {
    var expiresAt = payload.expires_at || Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600);
    return {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      expires_at: expiresAt,
      token_type: payload.token_type || 'bearer'
    };
  }

  function loadStoredSession() {
    try {
      var saved = window.localStorage.getItem(AUTH_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  }

  function storeSession(nextSession) {
    session = nextSession;
    if (session) window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(AUTH_SESSION_KEY);
  }

  function signIn(email, password) {
    return fetch(authUrl('/auth/v1/token?grant_type=password'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email: email, password: password })
    }).then(function (response) {
      if (!response.ok) throw new Error('sign_in_failed');
      return response.json();
    }).then(function (payload) {
      storeSession(normalizeSession(payload));
      return session;
    });
  }

  function recoverPassword(email) {
    return fetch('/api/admin-password-reset', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, redirectTo: recoveryRedirectUrl() })
    }).then(function (response) {
      if (!response.ok) throw new Error('password_recovery_failed');
      return response.json().catch(function () { return {}; });
    });
  }

  function updatePassword(password) {
    return ensureSession().then(function (activeSession) {
      if (!activeSession || !activeSession.access_token) throw new Error('session_required');
      return fetch(authUrl('/auth/v1/user'), {
        method: 'PUT',
        headers: authHeaders(activeSession.access_token),
        body: JSON.stringify({ password: password })
      });
    }).then(function (response) {
      if (!response.ok) throw new Error('password_update_failed');
      return response.json().catch(function () { return {}; });
    });
  }

  function consumeRecoverySessionFromUrl() {
    var hash = window.location.hash ? window.location.hash.slice(1) : '';
    var hashParams = new URLSearchParams(hash);
    var queryParams = new URLSearchParams(window.location.search);
    var isRecovery = hashParams.get('type') === 'recovery' || queryParams.get('recovery') === '1';

    if (hashParams.get('access_token')) {
      storeSession(normalizeSession({
        access_token: hashParams.get('access_token'),
        refresh_token: hashParams.get('refresh_token'),
        expires_at: hashParams.get('expires_at'),
        expires_in: hashParams.get('expires_in'),
        token_type: hashParams.get('token_type')
      }));
      currentUser = null;
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + '?recovery=1');
      }
      return true;
    }

    return Boolean(isRecovery && session && session.access_token);
  }

  function refreshSession() {
    if (!session || !session.refresh_token) return Promise.resolve(null);
    return fetch(authUrl('/auth/v1/token?grant_type=refresh_token'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ refresh_token: session.refresh_token })
    }).then(function (response) {
      if (!response.ok) throw new Error('session_refresh_failed');
      return response.json();
    }).then(function (payload) {
      storeSession(normalizeSession(payload));
      return session;
    });
  }

  function ensureSession() {
    if (!session) return Promise.resolve(null);
    var expiryMs = Number(session.expires_at || 0) * 1000;
    if (expiryMs && expiryMs - Date.now() > 60000) return Promise.resolve(session);
    return refreshSession().catch(function () {
      storeSession(null);
      currentUser = null;
      renderAuthPanel();
      return null;
    });
  }

  function fetchUser() {
    return ensureSession().then(function (activeSession) {
      if (!activeSession) return null;
      return fetch(authUrl('/auth/v1/user'), {
        headers: authHeaders(activeSession.access_token)
      }).then(function (response) {
        if (!response.ok) throw new Error('user_fetch_failed');
        return response.json();
      });
    }).then(function (user) {
      currentUser = user;
      return user;
    }).catch(function () {
      currentUser = null;
      return null;
    });
  }

  function isAdminUser(user) {
    var metadata = user && user.app_metadata ? user.app_metadata : {};
    return metadata.role === 'admin' || (Array.isArray(metadata.roles) && metadata.roles.indexOf('admin') !== -1);
  }

  function renderAuthPanel() {
    if (!authPanel.isConnected) {
      var topbar = document.querySelector('.admin-topbar');
      if (overview) overview.insertAdjacentElement('afterend', authPanel);
      else if (topbar) topbar.insertAdjacentElement('afterend', authPanel);
    }

    if (!model.isSupabaseConfigured()) {
      showLoginView('Sign in');
      authPanel.innerHTML = '';
      updateConnectionText('Publishing not connected');
      setStatus('Publishing not connected', false);
      return;
    }

    if (session && currentUser) {
      var admin = isAdminUser(currentUser);
      if (!admin) showLoginView('Sign in');
      else showEditorView();
      authPanel.innerHTML = '<div><strong>' + (admin ? 'Signed in' : 'This account cannot publish') + '</strong><p>' + escapeHtml(currentUser.email || 'Signed-in account') + (admin ? ' can publish homepage changes.' : ' needs publishing access before changes can go live.') + '</p></div><button class="admin-button admin-button-quiet" id="signOutBtn" type="button">Sign out</button>';
      document.getElementById('signOutBtn').addEventListener('click', function () {
        storeSession(null);
        currentUser = null;
        showLoginView('Sign in');
        renderAuthPanel();
        setStatus('Signed out', false);
      });
      updateConnectionText(admin ? 'Signed in' : 'No publishing access');
      return;
    }

    showLoginView('Sign in');
    authPanel.innerHTML = [
      '<form class="admin-login" id="adminLogin">',
      '<label><span class="admin-sr-only">Email</span><input class="admin-control" name="email" type="email" required autocomplete="email" aria-label="Email" placeholder="Login email" /></label>',
      '<label><span class="admin-sr-only">Password</span><input class="admin-control" name="password" type="password" required autocomplete="current-password" aria-label="Password" placeholder="Password" /></label>',
      '<button class="admin-button admin-button-primary" type="submit">Sign in</button>',
      '<button class="admin-login-secondary" id="forgotPasswordBtn" type="button">Forgot password?</button>',
      '</form>'
    ].join('');
    var loginForm = document.getElementById('adminLogin');
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var email = form.email.value.trim();
      var password = form.password.value;
      setStatus('Signing in...', false);
      signIn(email, password)
        .then(fetchUser)
        .then(function (user) {
          renderAuthPanel();
          if (isAdminUser(user)) {
            setStatus('Signed in. Ready to publish.', true);
            return loadInitialContent();
          }
          setStatus('This account cannot publish.', false);
        })
        .catch(function () {
          showLoginView('Sign in');
          setStatus('Sign-in failed', false);
        });
    });
    document.getElementById('forgotPasswordBtn').addEventListener('click', function () {
      var email = loginForm.email.value.trim();
      if (!email) {
        setStatus('Enter your email first', false);
        return;
      }
      setStatus('Sending reset link...', false);
      recoverPassword(email)
        .then(function () {
          setStatus('Reset link sent', true);
          notify('Reset link requested', 'If the address is hello@domivise.co.uk, check that inbox and spam folder. Supabase does not send reset emails for other addresses.', 'success');
        })
        .catch(function () {
          setStatus('Could not send reset link', false);
          notify('Reset failed', 'Check the email address and try again.', 'error');
        });
    });
    updateConnectionText('Sign in required');
  }

  function updateConnectionText(value) {
    if (connectionState) connectionState.textContent = value;
  }

  function loadInitialContent() {
    if (!isAdminUser(currentUser)) {
      showLoginView('Sign in');
      setStatus(model.isSupabaseConfigured() ? 'Sign in required' : 'Publishing not connected', false);
      return Promise.resolve();
    }

    showEditorView();
    ensurePreviewLoaded();

    if (!model.isSupabaseConfigured()) {
      content = model.loadLocal();
      remoteUnavailable = true;
      setStatus('Publishing not connected', false);
      render();
      postPreview();
      return Promise.resolve();
    }

    setStatus('Loading saved homepage...', false);
    return model.fetchPublished()
      .then(function (remoteContent) {
        content = remoteContent;
        remoteUnavailable = false;
        setStatus('Homepage loaded', true);
      })
      .catch(function () {
        content = model.loadLocal();
        remoteUnavailable = true;
        setStatus('Could not load saved homepage. Editing here only.', false);
        updateConnectionText('Publishing not connected');
      })
      .then(function () {
        render();
        postPreview();
        loadAnalytics();
      });
  }

  function saveCurrentContent() {
    if (model.isSupabaseConfigured()) {
      return ensureSession().then(function (activeSession) {
        if (!activeSession) {
          renderAuthPanel();
          setStatus('Sign in', false);
          notify('Sign in needed', 'Use your admin email and password before publishing.', 'warning');
          return null;
        }
        return (currentUser ? Promise.resolve(currentUser) : fetchUser()).then(function (user) {
          renderAuthPanel();
          if (!isAdminUser(user)) {
            setStatus('This account cannot publish', false);
            notify('Not published', 'This account does not have permission to publish changes.', 'error');
            return null;
          }
          setStatus('Publishing...', false);
          return model.saveRemote(content, activeSession.access_token)
            .then(function (saved) {
              content = saved;
              render();
              postPreview();
              setStatus('Published', true);
              notify('Changes published', 'Your homepage has been updated.', 'success');
              remoteUnavailable = false;
              updateConnectionText('Published');
            })
            .catch(function (error) {
              if (error.status === 401 || error.status === 403) {
                setStatus('Publish failed. Check your account access.', false);
                notify('Publish failed', 'Check your account access and try again.', 'error');
                return;
              }
              remoteUnavailable = true;
              model.saveLocal(content);
              setStatus('Connection issue. Saved here only.', true);
              notify('Saved here only', 'There was a connection issue, so the changes were saved only on this device.', 'warning');
              updateConnectionText('Publishing not connected');
            });
        });
      });
    }

    content = model.saveLocal(content);
    setStatus('Publishing not connected', false);
    notify('Not published', 'Publishing is not connected on this deployment. This change is saved only on this device.', 'warning');
    postPreview();
    return Promise.resolve();
  }

  var saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveCurrentContent);

  var resetBtn = document.getElementById('resetBtn');
  if (resetBtn) resetBtn.addEventListener('click', function () {
    if (!window.confirm('Start over and reset the editor to the original homepage text?')) return;
    content = model.clone(model.DEFAULT_CONTENT);
    render();
    postPreview();
    setStatus(remoteUnavailable ? 'Reset complete. Save to keep it here.' : 'Reset complete. Publish to make it live.', false);
    notify('Editor reset', remoteUnavailable ? 'The original homepage text is back in the editor.' : 'Publish when you are ready to make this reset live.', 'warning');
  });

  var exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'domivise-content.json';
      link.click();
      URL.revokeObjectURL(link.href);
    });

  var importFile = document.getElementById('importFile');
  if (importFile) importFile.addEventListener('change', function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        content = model.merge(model.DEFAULT_CONTENT, JSON.parse(reader.result));
        render();
        postPreview();
        setStatus(remoteUnavailable ? 'Imported. Save locally to keep it.' : 'Imported. Publish to keep it.', false);
      } catch (error) {
        window.alert('That file is not valid DomiVise content JSON.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  });

  document.querySelectorAll('.admin-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.querySelectorAll('.admin-nav a').forEach(function (item) { item.classList.remove('is-active'); });
      link.classList.add('is-active');
    });
  });
  if (preview) preview.addEventListener('load', postPreview);

  function start() {
    remoteUnavailable = !model.isSupabaseConfigured();
    if (overview && model.isSupabaseConfigured() && !authPanel.isConnected) overview.insertAdjacentElement('afterend', authPanel);
    if (model.isSupabaseConfigured() && consumeRecoverySessionFromUrl()) {
      showPasswordResetView();
      setStatus('Enter a new password', false);
      return;
    }
    renderAuthPanel();
    fetchUser().then(renderAuthPanel).then(loadInitialContent);
  }

  (model.ensureConfig ? model.ensureConfig() : Promise.resolve()).then(start);
})();
