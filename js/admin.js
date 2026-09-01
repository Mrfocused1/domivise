(function () {
  'use strict';

  var model = window.DomiViseContent;
  if (!model) return;

  var AUTH_SESSION_KEY = 'domivise-admin-session-v1';
  var config = window.DOMIVISE_SUPABASE_CONFIG || {};
  var content = model.loadLocal();
  var editor = document.getElementById('editorMount');
  var preview = document.getElementById('sitePreview');
  var saveState = document.getElementById('saveState');
  var connectionState = document.getElementById('adminConnectionState');
  var overview = document.getElementById('overview');
  var authPanel = document.createElement('section');
  var saveTimer;
  var session = loadStoredSession();
  var currentUser = null;
  var remoteUnavailable = !model.isSupabaseConfigured();

  authPanel.className = 'admin-auth-panel';
  if (overview) overview.insertAdjacentElement('afterend', authPanel);

  var GROUPS = [
    {
      id: 'hero', number: '01', title: 'Hero & proposition', description: 'The first message visitors see and the main conversion actions.',
      fields: [
        ['hero.eyebrow', 'Eyebrow', 'text'],
        ['hero.title', 'Main headline', 'textarea'],
        ['hero.strapline', 'Supporting strapline', 'textarea'],
        ['hero.description', 'Supporting description', 'textarea'],
        ['hero.scope', 'Jurisdiction line', 'textarea'],
        ['hero.primaryCta', 'Primary button', 'text'],
        ['hero.secondaryCta', 'Secondary button', 'text'],
        ['hero.bullets', 'Hero reassurance points', 'list'],
        ['hero.mediaTag', 'Preview media label', 'text'],
        ['hero.cardCaption', 'Image caption', 'text'],
        ['hero.statValue', 'Illustrative score', 'text'],
        ['hero.statLabel', 'Score label', 'textarea-short']
      ]
    },
    {
      id: 'product', number: '02', title: 'Product preview', description: 'The dashboard mockup and the promise beside it.',
      fields: [
        ['product.eyebrow', 'Section eyebrow', 'text'],
        ['product.proposition', 'Core brand proposition', 'text'],
        ['product.heading', 'Section heading', 'textarea'],
        ['product.bodyOne', 'Description one', 'textarea'],
        ['product.bodyTwo', 'Description two', 'textarea'],
        ['product.previewLabel', 'Preview disclaimer', 'text'],
        ['product.sampleName', 'Example greeting', 'text'],
        ['product.samplePortfolio', 'Example portfolio', 'text'],
        ['product.sampleBadge', 'Example badge', 'text'],
        ['product.scoreValue', 'Example health score', 'text'],
        ['product.scoreTitle', 'Score title', 'text'],
        ['product.scoreStatus', 'Score status', 'text'],
        ['product.tip', 'Example Domi tip', 'textarea'],
        { path: 'product.rows', label: 'Example dashboard rows', type: 'object-list', fields: [['title', 'Title'], ['detail', 'Detail'], ['pill', 'Status']] }
      ]
    },
    {
      id: 'sections', number: '03', title: 'Page sections', description: 'The problem, capabilities, Founding 100, health check and trust content.',
      fields: [
        { path: 'difference', label: 'The fragmentation problem', type: 'object', fields: [['heading', 'Heading'], ['rightNow', 'Right now', 'list'], ['withDomiVise', 'With DomiVise', 'list']] },
        { path: 'features', label: 'Core capabilities', type: 'object', fields: [['eyebrow', 'Eyebrow'], ['heading', 'Heading'], ['intro', 'Intro'], ['cards', 'Capability cards', 'object-list', [['title', 'Title'], ['body', 'Description']]]] },
        { path: 'testimonial', label: 'Founder quote', type: 'object', fields: [['quote', 'Quote'], ['author', 'Author'], ['role', 'Role']] },
        { path: 'founding', label: 'Founding 100', type: 'object', fields: [['label', 'Eyebrow'], ['heading', 'Heading'], ['intro', 'Intro'], ['limit', 'Member limit'], ['benefits', 'Benefits', 'object-list', [['title', 'Title'], ['body', 'Description']]], ['cta', 'Button'], ['note', 'Fine print']] },
        { path: 'health', label: 'Five-Minute Health Check', type: 'object', fields: [['label', 'Eyebrow'], ['heading', 'Heading'], ['body', 'Description'], ['chips', 'Topics', 'list'], ['meta', 'Meta line'], ['cta', 'Button'], ['note', 'Availability note'], ['score', 'Example score'], ['caption', 'Score caption']] },
        { path: 'trust', label: 'Trust section', type: 'object', fields: [['statusLabel', 'Status label'], ['statusBody', 'Status message'], ['whyLabel', 'Trust heading'], ['whyBody', 'Trust message'], ['cards', 'Trust cards', 'object-list', [['title', 'Title'], ['body', 'Description']]]] }]
    },
    {
      id: 'forms', number: '04', title: 'Application & email', description: 'Signup copy and public form settings. Resend credentials and notification recipients stay server-side.',
      fields: [
        ['join.eyebrow', 'Form eyebrow', 'text'],
        ['join.heading', 'Form heading', 'textarea'],
        ['join.body', 'Form intro', 'textarea'],
        ['join.bullets', 'Benefits beside the form', 'list'],
        ['join.nameLabel', 'Name label', 'text'],
        ['join.namePlaceholder', 'Name placeholder', 'text'],
        ['join.emailLabel', 'Email label', 'text'],
        ['join.emailPlaceholder', 'Email placeholder', 'text'],
        ['join.portfolioLabel', 'Portfolio label', 'text'],
        ['join.portfolioPlaceholder', 'Portfolio placeholder', 'text'],
        ['join.challengeLabel', 'Challenge label', 'text'],
        ['join.challengePlaceholder', 'Challenge placeholder', 'text'],
        ['join.consentNote', 'Required email notice', 'textarea'],
        ['join.marketingConsent', 'Optional marketing consent', 'textarea'],
        ['join.submit', 'Submit button', 'text'],
        ['join.finePrint', 'Privacy line', 'textarea'],
        ['join.successHeading', 'Success heading', 'text'],
        ['join.successBody', 'Success message', 'textarea'],
        ['site.contactEmail', 'Public contact email', 'email'],
        ['site.formEndpoint', 'Signup API endpoint', 'url'],
        { path: 'faq', label: 'FAQs', type: 'object', fields: [['eyebrow', 'Eyebrow'], ['heading', 'Heading'], ['note', 'Intro'], ['items', 'Questions and answers', 'object-list', [['question', 'Question'], ['answer', 'Answer']]]] }
      ]
    },
    {
      id: 'media', number: '05', title: 'Images, SEO & footer', description: 'Hosted media URLs, alternative text, search/social metadata and footer copy.',
      fields: [
        ['hero.backgroundImage', 'Hero background image', 'image'],
        ['hero.backgroundAlt', 'Hero background alt text', 'text'],
        ['hero.video', 'Hero video URL', 'url'],
        ['hero.videoPoster', 'Hero video poster', 'image'],
        ['hero.cardImage', 'Hero card image', 'image'],
        ['hero.cardAlt', 'Hero card alt text', 'text'],
        ['testimonial.image', 'Testimonial image', 'image'],
        ['testimonial.imageAlt', 'Testimonial image alt text', 'text'],
        ['faq.imageOne', 'FAQ image one', 'image'],
        ['faq.imageOneAlt', 'FAQ image one alt text', 'text'],
        ['faq.imageTwo', 'FAQ image two', 'image'],
        ['faq.imageTwoAlt', 'FAQ image two alt text', 'text'],
        ['site.pageTitle', 'Browser/page title', 'text'],
        ['site.metaDescription', 'Meta description', 'textarea'],
        ['site.canonicalUrl', 'Canonical URL', 'url'],
        ['site.ogTitle', 'Social title', 'text'],
        ['site.ogDescription', 'Social description', 'textarea'],
        ['site.socialImage', 'Social preview image', 'image'],
        ['site.ogImageAlt', 'Social preview alt text', 'text'],
        ['site.instagram', 'Instagram URL', 'url'],
        ['site.linkedin', 'LinkedIn URL', 'url'],
        ['site.footerCompanyDetails', 'Footer company details', 'textarea'],
        ['site.footerCredentialOne', 'Footer credential one', 'textarea'],
        ['site.footerCredentialTwo', 'Footer credential two', 'textarea'],
        ['site.footerCredentialThree', 'Footer credential three', 'textarea'],
        ['site.footerCredit', 'Footer credit line', 'text'],
        ['site.footerTagline', 'Footer brand tagline', 'text']
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
    if (type === 'textarea' || type === 'textarea-short') {
      control = '<textarea class="admin-control ' + (type === 'textarea-short' ? 'admin-short' : '') + '" id="' + id + '" data-path="' + path + '" rows="' + (type === 'textarea-short' ? '2' : '4') + '">' + escapeHtml(value) + '</textarea>';
    } else {
      var inputType = type === 'email' ? 'email' : type === 'url' || type === 'image' ? 'url' : 'text';
      control = '<input class="admin-control" id="' + id + '" data-path="' + path + '" type="' + inputType + '" value="' + escapeAttr(value) + '" />';
    }
    if (upload) {
      control = '<div class="admin-image-row">' + control + '<label class="admin-upload">Upload<input type="file" accept="image/*" data-upload-path="' + path + '" /></label></div>';
    }
    return '<div class="admin-field"><label for="' + id + '">' + escapeHtml(labelFor(path, label)) + '</label>' + control + (type === 'image' ? '<small>Use a hosted URL for shared content, or upload a local image for this browser.</small>' : '') + '</div>';
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

  function setDirty() {
    setStatus('Unsaved changes', false);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      setStatus(remoteUnavailable ? 'Ready to save locally' : 'Ready to publish', false);
    }, 800);
  }

  function update(path, value) {
    set(content, path, value);
    setDirty();
    postPreview();
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
    return config.url.replace(/\/$/, '') + path;
  }

  function authHeaders(token) {
    var headers = {
      apikey: config.publishableKey,
      'Content-Type': 'application/json'
    };
    if (token) headers.Authorization = 'Bearer ' + token;
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
    if (!model.isSupabaseConfigured()) {
      authPanel.innerHTML = '<div><strong>Supabase publishable key missing</strong><p>Add the project publishable key in <code>js/supabase-config.js</code> to enable remote load and publish. This is not a service-role credential.</p></div>';
      updateConnectionText('Local fallback');
      return;
    }

    if (session && currentUser) {
      var admin = isAdminUser(currentUser);
      authPanel.innerHTML = '<div><strong>' + (admin ? 'Signed in as admin' : 'Signed in without admin access') + '</strong><p>' + escapeHtml(currentUser.email || 'Authenticated user') + (admin ? ' can publish homepage content.' : ' cannot publish until app metadata includes role admin.') + '</p></div><button class="admin-button admin-button-quiet" id="signOutBtn" type="button">Sign out</button>';
      document.getElementById('signOutBtn').addEventListener('click', function () {
        storeSession(null);
        currentUser = null;
        renderAuthPanel();
        setStatus('Signed out', false);
      });
      updateConnectionText(admin ? 'Supabase admin' : 'Supabase signed in');
      return;
    }

    authPanel.innerHTML = [
      '<form class="admin-login" id="adminLogin">',
      '<div><strong>Sign in to publish</strong><p>Use a Supabase Auth account whose app metadata has <code>role: "admin"</code>.</p></div>',
      '<label>Email<input class="admin-control" name="email" type="email" required autocomplete="email" /></label>',
      '<label>Password<input class="admin-control" name="password" type="password" required autocomplete="current-password" /></label>',
      '<button class="admin-button admin-button-primary" type="submit">Sign in</button>',
      '</form>'
    ].join('');
    document.getElementById('adminLogin').addEventListener('submit', function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var email = form.email.value.trim();
      var password = form.password.value;
      setStatus('Signing in...', false);
      signIn(email, password)
        .then(fetchUser)
        .then(function (user) {
          renderAuthPanel();
          setStatus(isAdminUser(user) ? 'Signed in. Ready to publish.' : 'Signed in, but admin role is missing.', isAdminUser(user));
        })
        .catch(function () {
          setStatus('Sign-in failed', false);
        });
    });
    updateConnectionText('Supabase auth required');
  }

  function updateConnectionText(value) {
    if (connectionState) connectionState.textContent = value;
  }

  function loadInitialContent() {
    if (!model.isSupabaseConfigured()) {
      content = model.loadLocal();
      remoteUnavailable = true;
      setStatus('Supabase unavailable. Editing local fallback.', false);
      render();
      postPreview();
      return Promise.resolve();
    }

    setStatus('Loading published content...', false);
    return model.fetchPublished()
      .then(function (remoteContent) {
        content = remoteContent;
        remoteUnavailable = false;
        setStatus('Loaded from Supabase', true);
      })
      .catch(function () {
        content = model.loadLocal();
        remoteUnavailable = true;
        setStatus('Supabase unavailable. Editing local fallback.', false);
        updateConnectionText('Local fallback');
      })
      .then(function () {
        render();
        postPreview();
      });
  }

  function saveCurrentContent() {
    if (model.isSupabaseConfigured() && !remoteUnavailable) {
      return ensureSession().then(function (activeSession) {
        if (!activeSession) {
          renderAuthPanel();
          setStatus('Sign in to publish', false);
          return null;
        }
        if (currentUser && !isAdminUser(currentUser)) {
          setStatus('Admin role required', false);
          return null;
        }
        setStatus('Publishing to Supabase...', false);
        return model.saveRemote(content, activeSession.access_token)
          .then(function (saved) {
            content = saved;
            render();
            postPreview();
            setStatus('Published to Supabase', true);
            remoteUnavailable = false;
            updateConnectionText('Supabase connected');
          })
          .catch(function (error) {
            if (error.status === 401 || error.status === 403) {
              setStatus('Supabase rejected the publish', false);
              return;
            }
            remoteUnavailable = true;
            model.saveLocal(content);
            setStatus('Supabase unavailable. Saved locally.', true);
            updateConnectionText('Local fallback');
          });
      });
    }

    content = model.saveLocal(content);
    setStatus('Saved in this browser', true);
    postPreview();
    return Promise.resolve();
  }

  document.getElementById('saveBtn').addEventListener('click', saveCurrentContent);

  document.getElementById('resetBtn').addEventListener('click', function () {
    if (!window.confirm('Reset all editable content to the current site defaults?')) return;
    content = model.clone(model.DEFAULT_CONTENT);
    render();
    postPreview();
    setStatus(remoteUnavailable ? 'Reset to defaults. Save locally to keep it.' : 'Reset to defaults. Publish to keep it.', false);
  });

  document.getElementById('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'domivise-content.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.getElementById('importFile').addEventListener('change', function (event) {
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

  renderAuthPanel();
  fetchUser().then(renderAuthPanel).then(loadInitialContent);
})();
