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
  var overview = document.getElementById('overview');
  var authPanel = document.createElement('section');
  var saveTimer;
  var session = loadStoredSession();
  var currentUser = null;
  var remoteUnavailable = true;

  authPanel.className = 'admin-auth-panel';

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

  function authHeaders(token) {
    var config = getConfig();
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
      authPanel.remove();
      updateConnectionText('Publishing not connected');
      return;
    }

    if (!authPanel.isConnected) {
      var topbar = document.querySelector('.admin-topbar');
      if (overview) overview.insertAdjacentElement('afterend', authPanel);
      else if (topbar) topbar.insertAdjacentElement('afterend', authPanel);
    }

    if (session && currentUser) {
      var admin = isAdminUser(currentUser);
      authPanel.innerHTML = '<div><strong>' + (admin ? 'Signed in' : 'This account cannot publish') + '</strong><p>' + escapeHtml(currentUser.email || 'Signed-in account') + (admin ? ' can publish homepage changes.' : ' needs publishing access before changes can go live.') + '</p></div><button class="admin-button admin-button-quiet" id="signOutBtn" type="button">Sign out</button>';
      document.getElementById('signOutBtn').addEventListener('click', function () {
        storeSession(null);
        currentUser = null;
        renderAuthPanel();
        setStatus('Signed out', false);
      });
      updateConnectionText(admin ? 'Signed in' : 'No publishing access');
      return;
    }

    authPanel.innerHTML = [
      '<form class="admin-login" id="adminLogin">',
      '<div><strong>Sign in to publish</strong><p>Use your DomiVise admin email and password.</p></div>',
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
          setStatus(isAdminUser(user) ? 'Signed in. Ready to publish.' : 'This account cannot publish.', isAdminUser(user));
        })
        .catch(function () {
          setStatus('Sign-in failed', false);
        });
    });
    updateConnectionText('Sign in required');
  }

  function updateConnectionText(value) {
    if (connectionState) connectionState.textContent = value;
  }

  function loadInitialContent() {
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
      });
  }

  function saveCurrentContent() {
    if (model.isSupabaseConfigured()) {
      return ensureSession().then(function (activeSession) {
        if (!activeSession) {
          renderAuthPanel();
          setStatus('Sign in to publish', false);
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
    renderAuthPanel();
    fetchUser().then(renderAuthPanel).then(loadInitialContent);
  }

  (model.ensureConfig ? model.ensureConfig() : Promise.resolve()).then(start);
})();
  function getConfig() {
    return window.DOMIVISE_SUPABASE_CONFIG || {};
  }
