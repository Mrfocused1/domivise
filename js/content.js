(function () {
  'use strict';

  var STORAGE_KEY = 'domivise-content-v1';
  var HOMEPAGE_ID = 'homepage';

  var DEFAULT_CONTENT = {
    site: {
      pageTitle: 'DomiVise | Intelligent Property Management for Landlords Across the UK',
      metaDescription: 'DomiVise brings portfolio management, rent, compliance, maintenance, documents and guidance into one calm platform for landlords across England, Wales, Scotland and Northern Ireland.',
      ogTitle: 'DomiVise | Intelligent Property Management for Landlords Across the UK',
      ogDescription: 'Know what your rental property needs before it becomes a problem. Built for landlords across England, Wales, Scotland and Northern Ireland.',
      ogUrl: 'https://domivise.co.uk/',
      socialImage: 'https://domivise.co.uk/img/social-preview.png',
      canonicalUrl: 'https://domivise.co.uk/',
      ogImageAlt: 'DomiVise branded preview: Know what your rental property needs before it becomes a problem.',
      twitterTitle: 'DomiVise | Intelligent Property Management for Landlords Across the UK',
      twitterDescription: 'Every property task. One connected platform. Built for landlords across the UK.',
      twitterImage: 'https://domivise.co.uk/img/social-preview.png',
      twitterImageAlt: 'DomiVise branded preview: Know what your rental property needs before it becomes a problem.',
      organizationUrl: 'https://domivise.co.uk/',
      organizationDescription: 'Intelligent property management and landlord advisory platform built for landlords across England, Wales, Scotland and Northern Ireland.',
      organizationEmail: 'hello@domivise.co.uk',
      contactEmail: 'hello@domivise.co.uk',
      formEndpoint: '/api/founding-100',
      instagram: 'https://instagram.com/domivise',
      linkedin: 'https://www.linkedin.com/company/domivise-ltd/',
      navPlatformLabel: 'What is DomiVise',
      navFeaturesLabel: 'How it helps',
      navFoundingLabel: 'Founding 100',
      navHealthLabel: 'Health check',
      navFaqLabel: 'FAQ',
      navCtaLabel: 'Join the Founding 100',
      footerPlatformLabel: 'What is DomiVise',
      footerFeaturesLabel: 'How it helps',
      footerFoundingLabel: 'Founding 100',
      footerJoinLabel: 'Join',
      footerHealthLabel: 'Five-Minute Health Check',
      footerFaqLabel: 'FAQ',
      footerAdminLabel: 'Admin',
      footerContactLabel: 'Contact us',
      homeLabel: 'Home',
      instagramLabel: 'Instagram',
      linkedinLabel: 'LinkedIn',
      privacyPolicyLabel: 'Privacy Policy',
      termsOfUseLabel: 'Terms of Use',
      footerCompanyDetails: 'DomiVise Ltd\nCompany No. 17415511\nRegistered in England and Wales\nSupporting landlords across the United Kingdom',
      footerCredentialOne: 'Built for landlords across the UK.\nGuidance tailored to England, Wales, Scotland and Northern Ireland.',
      footerCredentialTwo: '“Registered in England and Wales” refers to the company’s legal registration and does not limit DomiVise’s UK-wide service coverage.',
      footerCredentialThree: 'Product in active development — founding members get first access.',
      footerTagline: 'The calmer home for your rental portfolio',
      footerCredit: 'Intelligent property management for landlords across the UK.',
      copyright: '© {year} DomiVise Ltd. All rights reserved.',
      logoAlt: 'DomiVise',
      logoHomeLabel: 'DomiVise logo, click to go to the home page.'
    },
    hero: {
      eyebrow: 'Built for landlords across the UK',
      title: 'Know what your\nrental property needs —\nbefore it becomes a problem.',
      strapline: 'Every property task.\nOne connected platform.',
      description: 'Manage your properties, rent, compliance, maintenance and documents in one place, with intelligent guidance helping you understand what needs attention next.',
      scope: 'Guidance tailored for:\nEngland, Wales, Scotland and Northern Ireland.',
      primaryCta: 'Join the Founding 100',
      secondaryCta: 'Early access to the health check',
      bullets: ['Free to join', 'Limited to the first 100 landlords', 'No card required', 'Built for landlords across the UK'],
      mediaTag: 'Your portfolio, one timeline',
      cardCaption: 'London terraces, tracked clearly.',
      statValue: '86',
      statLabel: 'Illustrative portfolio\nhealth score',
      backgroundImage: 'https://images.pexels.com/videos/27745691/pexels-photo-27745691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600',
      backgroundAlt: '',
      video: 'https://videos.pexels.com/video-files/27745691/12217557_1280_720_30fps.mp4',
      videoPoster: 'https://images.pexels.com/videos/27745691/pexels-photo-27745691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600',
      cardImage: 'https://images.pexels.com/photos/3639504/pexels-photo-3639504.jpeg?auto=compress&cs=tinysrgb&w=700',
      cardAlt: 'Victorian terraced houses on a quiet London street.'
    },
    difference: {
      heading: 'Landlord admin is scattered.',
      rightNow: [
        'Compliance deadlines live in email threads and memory',
        'Information duplicated across spreadsheets, emails and messages',
        'Maintenance managed over messages with no clear place to follow it',
        'Rent and tenancy dates tracked in too many places',
        'Property questions answered from forums, memory and guesswork'
      ],
      withDomiVise: [
        'One timeline for every deadline, explained in plain English',
        'Every property detail and document in one place',
        'Repairs logged and tracked from report to resolution',
        'Rent and tenancy dates clear across the portfolio',
        'Guidance that helps you see what needs attention next'
      ]
    },
    product: {
      eyebrow: 'What is DomiVise?',
      proposition: 'One property. One platform. Better decisions.',
      heading: 'The co-manager for\nyour portfolio.',
      bodyOne: 'DomiVise will be an intelligent property management and landlord advisory platform. It brings portfolio management, rent, compliance, maintenance and documents into one organised place.',
      bodyTwo: 'It helps organise your information, highlight risks and explain what to do next — so managing your properties feels simpler and your decisions feel clearer.',
      previewLabel: 'Illustrative product preview · final product may vary',
      sampleName: 'Good morning, Sarah',
      samplePortfolio: '4 properties · London',
      sampleBadge: 'Founding member',
      scoreValue: '86',
      scoreTitle: 'Portfolio health',
      scoreStatus: 'Good — 3 actions suggested',
      rows: [
        { title: 'Gas Safety · Flat B', detail: 'Renewed · valid to Mar 2027', pill: 'Done' },
        { title: 'EICR · Terrace N1', detail: 'Due in 42 days', pill: 'Book' }
      ],
      tip: 'your EPC for Flat C could reach band C with two low-cost upgrades.'
    },
    features: {
      eyebrow: 'How DomiVise helps',
      heading: 'Everything that’s scattered today.\nOne calm platform tomorrow.',
      intro: 'The core areas DomiVise will cover from day one — shaped around how landlords actually work.',
      cards: [
        { title: 'Property health checks', body: 'A live 0–100 health score for every property, with prioritised actions so you always know what needs attention first.' },
        { title: 'Compliance guidance', body: 'Gas, electrical, EPC, alarms and licensing tracked in one timeline — with plain-English explanations of what each rule means for you.' },
        { title: 'Document management', body: 'Certificates, agreements and receipts stored against each property, auto-tagged and findable in seconds.' },
        { title: 'Maintenance support', body: 'Log issues in seconds, triage by urgency, and keep quotes plus a full repair history per property.' },
        { title: 'Rent & tenancy oversight', body: 'See rent status, arrears and important tenancy dates across your portfolio at a glance.' },
        { title: 'Intelligent guidance', body: 'Ask what matters for your property and get clear, practical guidance that helps you understand risks and decide what to do next.' }
      ]
    },
    testimonial: {
      quote: '“UK landlords hold the system together — often with spreadsheets, memory and late nights. We’re building DomiVise so that running a rental well no longer depends on holding everything in your head. The first 100 won’t just use this product. They’ll build it with us.”',
      author: 'Derryal Swaby',
      role: 'Founder, DomiVise',
      image: 'https://images.pexels.com/videos/27745691/pexels-photo-27745691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600',
      imageAlt: 'Aerial view of classic British terraced townhouses in Halifax.'
    },
    founding: {
      label: 'The Founding 100',
      heading: 'We’re inviting 100 UK landlords to build this with us',
      intro: 'While we build DomiVise for landlords across the UK, we want the people who will actually use it to help shape what comes next. Not a mailing list — a working group. You’ll see the product early, tell us what’s missing, and your feedback will steer what ships.',
      limit: 'Limited to 100 founding landlords.',
      benefits: [
        { title: 'Earliest access', body: 'Use DomiVise before anyone else, from the first private beta onwards.' },
        { title: 'Shape the product', body: 'Your problems become our roadmap. Vote on features, join feedback sessions, be heard.' },
        { title: 'Priority onboarding', body: 'Hands-on help migrating your portfolio, documents and dates when the beta opens.' },
        { title: 'Founding-member terms', body: 'Pricing benefits locked in for founding members when public plans launch.' },
        { title: 'Direct line to the founders', body: 'No ticket queues. Message us directly and get answers from the people building it.' },
        { title: 'Founding status', body: 'A visible founding member badge in the app — and credit where it’s due.' }
      ],
      cta: 'Claim your founding spot',
      note: 'No payment now. No commitment beyond honest feedback.'
    },
    health: {
      label: 'Coming with the beta',
      heading: 'The Five-Minute\nProperty Health Check',
      body: 'A quick guided review of one property — compliance status, energy efficiency, documentation, maintenance risks and tenancy setup — ending with a personalised health score and action list.',
      chips: ['Compliance', 'Energy efficiency', 'Documentation', 'Maintenance risk', 'Tenancy setup'],
      meta: '5 minutes · Free · No app needed',
      cta: 'Get early access to the health check',
      note: 'The full questionnaire arrives with the beta — Founding 100 members get it before anyone else.',
      score: '78',
      caption: 'Sample property score'
    },
    join: {
      eyebrow: 'Founding 100 application',
      heading: 'Claim your spot.\nIt takes 60 seconds.',
      body: 'Tell us a little about your portfolio and what hurts most today. We’ll confirm your place, and you’ll hear from us as the beta comes together.',
      bullets: ['Free to join — no card, no commitment', 'First look at the beta before public launch', 'Your feedback directly shapes what gets built'],
      nameLabel: 'Full name *',
      namePlaceholder: 'Enter your name',
      emailLabel: 'Email address *',
      emailPlaceholder: 'you@example.co.uk',
      portfolioLabel: 'Properties / units *',
      portfolioPlaceholder: 'How many do you let?',
      portfolioOptions: [
        { value: '1', label: '1' },
        { value: '2-4', label: '2–4' },
        { value: '5-10', label: '5–10' },
        { value: '11-25', label: '11–25' },
        { value: '26-50', label: '26–50' },
        { value: '50+', label: '50+' }
      ],
      challengeLabel: 'Biggest property-management challenge',
      challengePlaceholder: 'e.g. keeping up with compliance deadlines across 6 flats…',
      privacyNoticeVersion: '2026-08-30',
      programmeCommunicationsNotice: 'Founding 100 and private-beta communications are necessary to process this application and administer early access.',
      consentNote: 'By applying, you understand we’ll email you about your Founding 100 application, private-beta access and essential product-administration updates.',
      marketingConsent: 'I’d also like to receive optional DomiVise marketing updates. I can unsubscribe at any time.',
      submit: 'Apply to join the Founding 100',
      finePrint: 'Optional marketing is separate from Founding 100 and private-beta administration. See our {privacy}.',
      successHeading: 'Application received.',
      successBody: 'Welcome to the Founding 100. We’ve sent a confirmation email and will be in touch with next steps as the beta comes together.',
      successContactLabel: 'Any questions?'
    },
    email: {
      applicantSubject: 'Welcome to the DomiVise Founding 100',
      applicantHeading: 'Welcome to the DomiVise Founding 100',
      applicantGreeting: 'Hi [name],',
      applicantBody: 'Thanks for applying to join the DomiVise Founding 100.\n\nWe have received your details and will contact you about private-beta access and next steps as the product comes together.\n\nDomiVise will support landlords across England, Wales, Scotland and Northern Ireland, with guidance tailored to the relevant jurisdiction.',
      applicantSignature: 'Derryal Swaby\nFounder, DomiVise',
      notificationSubject: 'New Founding 100 application from [name]',
      notificationHeading: 'New Founding 100 application',
      notificationIntro: 'A new Founding 100 application was submitted from the landing page.'
    },
    trust: {
      statusLabel: 'Status: in active development',
      statusBody: 'DomiVise is not launched yet — everything you’ve read describes what we are building, not what is live today. Joining the Founding 100 reserves your place and adds you to the build journey.',
      whyLabel: 'Why trust us',
      whyBody: 'Built for landlords across the UK. DomiVise will support England, Wales, Scotland and Northern Ireland, with guidance tailored to the relevant jurisdiction. It provides property-management tools and general guidance, not regulated legal, financial or tax advice. Important decisions stay yours.',
      cards: [
        { title: 'UK-wide by design', body: 'We are building for landlords across England, Wales, Scotland and Northern Ireland, with guidance tailored to each relevant jurisdiction.' },
        { title: 'Transparent development', body: 'Regular progress updates to founding members, an open roadmap, and honest timelines. You’ll always know what’s real.' },
        { title: 'Your data, respected', body: 'Your information stays organised and under your control. You can request an export or deletion of your data.' }
      ]
    },
    faq: {
      eyebrow: 'FAQs',
      heading: 'Fair questions,\nstraight answers',
      note: 'Something else on your mind? Email us at {email} — as a founding member you’ll always have a direct line.',
      imageOne: 'https://images.pexels.com/photos/12742348/pexels-photo-12742348.jpeg?auto=compress&cs=tinysrgb&w=900',
      imageOneAlt: 'Modern rental living room in the UK.',
      imageTwo: 'https://images.pexels.com/photos/18729217/pexels-photo-18729217.jpeg?auto=compress&cs=tinysrgb&w=900',
      imageTwoAlt: 'Classic Georgian terraced houses in Notting Hill, London.',
      items: [
        { question: 'When is DomiVise launching?', answer: 'The app is in active development now. Founding 100 members get access to the private beta first; public launch follows once their feedback has shaped the product. We share progress openly with members rather than promising a date we might miss.' },
        { question: 'Is it free to join?', answer: 'Completely. Joining costs nothing and commits you to nothing — no card details, no contract. You’re reserving a place and agreeing to tell us what you think.' },
        { question: 'Who is DomiVise for?', answer: 'Landlords across England, Wales, Scotland and Northern Ireland managing anything from a first flat to a multi-property portfolio. DomiVise will tailor guidance to the relevant jurisdiction while keeping compliance, maintenance, rent and paperwork in one place.' },
        { question: 'What does Founding 100 membership actually mean?', answer: 'You join before launch, use the product as it develops, and help decide what gets built. In return: earliest access, priority onboarding, direct access to the founders, founding-member pricing benefits and permanent recognition as one of the first 100.' },
        { question: 'Will it replace my accountant, agent or solicitor?', answer: 'No. DomiVise organises your portfolio and gives clear general guidance grounded in UK rules — but it doesn’t replace regulated professional advice for legal, tax or financial decisions. Think of it as the system that keeps everything, and everyone, on track.' },
        { question: 'Is my data safe?', answer: 'Privacy is built in from the start: your data is never sold, and you can request an export or deletion at any time. Full details are in our privacy policy.' }
      ]
    }
  };

  function getConfig() {
    return window.DOMIVISE_SUPABASE_CONFIG || {};
  }

  function ensureConfig() {
    var ready = window.DOMIVISE_SUPABASE_CONFIG_READY;
    if (ready && typeof ready.then === 'function') {
      return ready.catch(function () { return getConfig(); });
    }
    return Promise.resolve(getConfig());
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(base, override) {
    var result = clone(base);
    if (!override || typeof override !== 'object') return result;
    Object.keys(override).forEach(function (key) {
      if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = merge(result[key], override[key]);
      } else if (override[key] !== undefined) {
        result[key] = override[key];
      }
    });
    return result;
  }

  function isSupabaseConfigured() {
    var CONFIG = getConfig();
    return Boolean(CONFIG.url && CONFIG.publishableKey && CONFIG.publishableKey.indexOf('replace-') !== 0);
  }

  function restUrl(path) {
    var CONFIG = getConfig();
    return CONFIG.url.replace(/\/$/, '') + path;
  }

  function supabaseHeaders(token) {
    var CONFIG = getConfig();
    var headers = {
      apikey: CONFIG.publishableKey,
      Authorization: 'Bearer ' + (token || CONFIG.publishableKey),
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    return headers;
  }

  function loadLocal() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? merge(DEFAULT_CONTENT, JSON.parse(saved)) : clone(DEFAULT_CONTENT);
    } catch (error) {
      return clone(DEFAULT_CONTENT);
    }
  }

  function load() {
    if (isSupabaseConfigured() && !isAdminPreview() && !isAdminPage()) return clone(DEFAULT_CONTENT);
    return loadLocal();
  }

  function fetchPublished() {
    if (!isSupabaseConfigured() || !window.fetch) {
      return Promise.reject(new Error('supabase_unavailable'));
    }
    var query = '/rest/v1/site_content?id=eq.' + encodeURIComponent(HOMEPAGE_ID) + '&is_published=eq.true&select=content&limit=1';
    return fetch(restUrl(query), { headers: supabaseHeaders() })
      .then(function (response) {
        if (!response.ok) throw new Error('published_content_unavailable');
        return response.json();
      })
      .then(function (rows) {
        return merge(DEFAULT_CONTENT, rows && rows[0] && rows[0].content ? rows[0].content : {});
      });
  }

  function saveRemote(content, token) {
    if (!isSupabaseConfigured() || !window.fetch || !token) {
      return Promise.reject(new Error('supabase_unavailable'));
    }
    var next = merge(DEFAULT_CONTENT, content || {});
    return fetch(restUrl('/rest/v1/site_content'), {
      method: 'POST',
      headers: Object.assign(supabaseHeaders(token), { Prefer: 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify({ id: HOMEPAGE_ID, content: next, is_published: true })
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().catch(function () { return {}; }).then(function (body) {
            var error = new Error(body.message || 'remote_save_failed');
            error.status = response.status;
            throw error;
          });
        }
        return response.json();
      })
      .then(function (rows) {
        var saved = rows && rows[0] && rows[0].content ? rows[0].content : next;
        window.domiviseContent = merge(DEFAULT_CONTENT, saved);
        return window.domiviseContent;
      });
  }

  function isAdminPreview() {
    return window.location.search.indexOf('adminPreview=1') !== -1;
  }

  function isAdminPage() {
    return Boolean(document.body && document.body.classList.contains('admin-body'));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function setText(selector, value, breaks) {
    var nodes = document.querySelectorAll(selector);
    nodes.forEach(function (node) {
      node.innerHTML = breaks ? escapeHtml(value).replace(/\n/g, '<br />') : escapeHtml(value);
    });
  }

  function setLabel(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.innerHTML = '<span class="category-label_square"></span>' + escapeHtml(value);
  }

  function setButton(selector, value) {
    var node = document.querySelector(selector);
    if (!node) return;
    node.querySelectorAll('.btn_label').forEach(function (label) { label.textContent = value; });
  }

  function setList(selector, values) {
    document.querySelectorAll(selector).forEach(function (node, index) {
      if (values[index] !== undefined) node.textContent = values[index];
    });
  }

  function setImage(selector, src, alt) {
    var node = document.querySelector(selector);
    if (!node) return;
    if (src) node.setAttribute('src', src);
    if (alt !== undefined) node.setAttribute('alt', alt);
  }

  function setLinkText(selector, value) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = value;
    });
  }

  function setInputValue(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.value = value || '';
  }

  function setPortfolioOptions(content) {
    var select = document.querySelector('#fld-size');
    if (!select) return;
    var selected = select.value;
    var options = Array.isArray(content.join.portfolioOptions) ? content.join.portfolioOptions : [];
    var html = '<option value="" disabled>' + escapeHtml(content.join.portfolioPlaceholder) + '</option>';
    html += options.map(function (option) {
      var value = option && option.value != null ? String(option.value) : '';
      var label = option && option.label != null ? String(option.label) : value;
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(label) + '</option>';
    }).join('');
    select.innerHTML = html;
    if (selected && options.some(function (option) { return option && String(option.value) === selected; })) {
      select.value = selected;
    } else {
      select.value = '';
      var emptyOption = select.querySelector('option[value=""]');
      if (emptyOption) emptyOption.selected = true;
    }
  }

  function apply(content) {
    content = merge(DEFAULT_CONTENT, content || {});
    window.domiviseContent = content;

    if (!document.querySelector('body:not(.admin-body)')) return content;
    document.title = content.site.pageTitle;
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', content.site.metaDescription);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', content.site.canonicalUrl);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', content.site.ogTitle);
    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', content.site.ogDescription);
    document.querySelectorAll('meta[property="og:image"], meta[property="og:image:secure_url"]').forEach(function (node) { node.setAttribute('content', content.site.socialImage); });
    document.querySelectorAll('meta[name="twitter:image"]').forEach(function (node) { node.setAttribute('content', content.site.twitterImage || content.site.socialImage); });
    document.querySelectorAll('meta[name="twitter:title"]').forEach(function (node) { node.setAttribute('content', content.site.twitterTitle || content.site.ogTitle); });
    document.querySelectorAll('meta[name="twitter:description"]').forEach(function (node) { node.setAttribute('content', content.site.twitterDescription || content.site.ogDescription); });
    document.querySelectorAll('meta[property="og:url"]').forEach(function (node) { node.setAttribute('content', content.site.ogUrl || content.site.canonicalUrl); });
    document.querySelectorAll('meta[property="og:image:alt"]').forEach(function (node) { node.setAttribute('content', content.site.ogImageAlt); });
    document.querySelectorAll('meta[name="twitter:image:alt"]').forEach(function (node) { node.setAttribute('content', content.site.twitterImageAlt || content.site.ogImageAlt); });

    setLinkText('.nav_links a[href="#platform"], .nav_overlay a[href="#platform"]', content.site.navPlatformLabel);
    setLinkText('.nav_links a[href="#features"], .nav_overlay a[href="#features"]', content.site.navFeaturesLabel);
    setLinkText('.nav_links a[href="#founding"], .nav_overlay a[href="#founding"]', content.site.navFoundingLabel);
    setLinkText('.nav_links a[href="#health-check"], .nav_overlay a[href="#health-check"]', content.site.navHealthLabel);
    setLinkText('.nav_links a[href="#faq"], .nav_overlay a[href="#faq"]', content.site.navFaqLabel);
    setButton('.nav .btn_nav-cta', content.site.navCtaLabel || content.hero.primaryCta);
    setLinkText('.nav_overlay .is-secondary a[href="/"]', content.site.homeLabel);
    setLinkText('[data-social-link="instagram"]', content.site.instagramLabel);
    setLinkText('[data-social-link="linkedin"]', content.site.linkedinLabel);
    setLinkText('.nav_overlay .is-secondary a[href="/privacy"], .footer_nav-small a[href="/privacy"]', content.site.privacyPolicyLabel);
    setLinkText('.nav_overlay .is-secondary a[href="/terms"], .footer_nav-small a[href="/terms"]', content.site.termsOfUseLabel);

    setLabel('.hero_copy .category-label', content.hero.eyebrow);
    setText('.hero_copy h1', content.hero.title, true);
    setText('.hero_copy > .subtitle-2', content.hero.strapline, true);
    setText('.hero_subtitle', content.hero.description);
    setText('.hero_scope', content.hero.scope, true);
    setButton('.hero_ctas .btn_primary', content.hero.primaryCta);
    setButton('.hero_ctas .btn_secondary', content.hero.secondaryCta);
    setList('.hero_list:not(.dv-ticks) li', content.hero.bullets);
    setText('.hero_media-tag', content.hero.mediaTag);
    setText('.hero_media-card figcaption', content.hero.cardCaption);
    setText('.hero_stat strong', content.hero.statValue);
    setText('.hero_stat span', content.hero.statLabel, true);
    setImage('.hero_media-bg img', content.hero.backgroundImage, content.hero.backgroundAlt);
    setImage('.hero_media-card img', content.hero.cardImage, content.hero.cardAlt);
    var heroVideo = document.querySelector('.hero_media-main video');
    if (heroVideo) { heroVideo.src = content.hero.video; heroVideo.poster = content.hero.videoPoster; }

    setText('#difference h2', content.difference.heading, true);
    setList('#difference .dv-card:first-child li', content.difference.rightNow);
    setList('#difference .dv-card_dark li', content.difference.withDomiVise);

    setLabel('#platform .product_copy .category-label', content.product.eyebrow);
    setText('.dv-proposition', content.product.proposition);
    setText('#platform .product_copy h2', content.product.heading, true);
    setText('#platform .product_copy .subtitle-1:nth-of-type(1)', content.product.bodyOne);
    setText('#platform .product_copy .subtitle-1:nth-of-type(2)', content.product.bodyTwo);
    setText('.dv-preview-label', content.product.previewLabel);
    setText('.dv-mock_head strong', content.product.sampleName);
    setText('.dv-mock_head > div > span', content.product.samplePortfolio);
    setText('.dv-mock_head em', content.product.sampleBadge);
    setText('.dv-mock_score .dv-score-ring b', content.product.scoreValue);
    setText('.dv-mock_score strong', content.product.scoreTitle);
    setText('.dv-mock_score div span', content.product.scoreStatus);
    document.querySelectorAll('.dv-mock_row').forEach(function (row, index) {
      var item = content.product.rows[index];
      if (!item) return;
      var title = row.querySelector('div strong');
      var detail = row.querySelector('div span');
      var pill = row.querySelector('em');
      if (title) title.textContent = item.title;
      if (detail) detail.textContent = item.detail;
      if (pill) pill.textContent = item.pill;
    });
    var domiTip = document.querySelector('.dv-mock_tip p');
    if (domiTip) domiTip.innerHTML = '<strong>Domi tip:</strong> ' + escapeHtml(content.product.tip);

    setLabel('#features .how_header .category-label', content.features.eyebrow);
    setText('#features .how_header h2', content.features.heading, true);
    setText('#features .how_header .subtitle-1', content.features.intro);
    document.querySelectorAll('#features .tab').forEach(function (tab, index) {
      var item = content.features.cards[index];
      if (!item) return;
      setText('#features .tab:nth-child(' + (index + 1) + ') h3', item.title);
      setText('#features .tab:nth-child(' + (index + 1) + ') p', item.body);
    });

    setText('.testimonial_quote > p', content.testimonial.quote);
    setText('.testimonial_quote footer strong', content.testimonial.author);
    setText('.testimonial_quote footer span', content.testimonial.role);
    setImage('.testimonial_bg img', content.testimonial.image, content.testimonial.imageAlt);

    setText('#founding .cs_header .label', content.founding.label);
    setText('#founding .cs_header h2', content.founding.heading, true);
    setText('.dv-founding-lead', content.founding.intro);
    setText('.dv-spots .label', content.founding.limit);
    document.querySelectorAll('.dv-benefit-grid .tab').forEach(function (tab, index) {
      var item = content.founding.benefits[index];
      if (!item) return;
      setText('.dv-benefit-grid .tab:nth-child(' + (index + 1) + ') h3', item.title);
      setText('.dv-benefit-grid .tab:nth-child(' + (index + 1) + ') p.body-medium', item.body);
    });
    setButton('#founding .dv-center .btn_primary', content.founding.cta);
    setText('.dv-note', content.founding.note);

    setText('#health-check .service_grid .label:first-child', content.health.label);
    setText('#health-check h2', content.health.heading, true);
    setText('#health-check .subtitle-2', content.health.body);
    setList('#health-check .dv-chips li', content.health.chips);
    setText('#health-check .service_grid > div:first-child > .label:nth-of-type(2)', content.health.meta);
    setButton('#health-check .btn_primary', content.health.cta);
    setText('#health-check .dv-small', content.health.note);
    setText('.dv-hc_center strong', content.health.score);
    setText('.dv-hc_caption', content.health.caption);

    setLabel('.dv-join-copy .category-label', content.join.eyebrow);
    setText('.dv-join-copy h2', content.join.heading, true);
    setText('.dv-join-copy .subtitle-2', content.join.body);
    setList('.dv-ticks li', content.join.bullets);
    var fields = [
      ['#fld-name', content.join.nameLabel, content.join.namePlaceholder],
      ['#fld-email', content.join.emailLabel, content.join.emailPlaceholder],
      ['#fld-size', content.join.portfolioLabel, content.join.portfolioPlaceholder],
      ['#fld-challenge', content.join.challengeLabel, content.join.challengePlaceholder]
    ];
    fields.forEach(function (field) {
      var input = document.querySelector(field[0]);
      if (!input) return;
      var label = document.querySelector('label[for="' + input.id + '"]');
      if (label) label.textContent = field[1];
      if (input.tagName === 'SELECT') {
        setPortfolioOptions(content);
      } else {
        input.setAttribute('placeholder', field[2]);
      }
    });
    setInputValue('input[name="Privacy-Notice-Version"]', content.join.privacyNoticeVersion);
    setInputValue('input[name="Programme-Communications-Notice"]', content.join.programmeCommunicationsNotice);
    setText('.dv-consent-note', content.join.consentNote);
    setText('.dv-consent span', content.join.marketingConsent);
    setButton('#submitBtn', content.join.submit);
    var finePrint = document.querySelector('.dv-center-text');
    if (finePrint) finePrint.innerHTML = escapeHtml(content.join.finePrint).replace('{privacy}', '<a href="/privacy">privacy policy</a>');
    setText('#joinSuccess h3', content.join.successHeading);
    setText('#joinSuccess > p:first-of-type', content.join.successBody);
    var successContact = document.querySelector('#joinSuccess > p:last-child');
    if (successContact) successContact.innerHTML = escapeHtml(content.join.successContactLabel) + ' <a href="mailto:' + escapeHtml(content.site.contactEmail) + '">' + escapeHtml(content.site.contactEmail) + '</a>';

    setLabel('.dv-status .category-label', content.trust.statusLabel);
    setText('.dv-status .subtitle-2', content.trust.statusBody);
    setText('.trust .difference_block .label', content.trust.whyLabel);
    setText('.trust .difference_block .subtitle-1', content.trust.whyBody);
    document.querySelectorAll('.trust .dv-feature-grid .tab').forEach(function (tab, index) {
      var item = content.trust.cards[index];
      if (!item) return;
      setText('.trust .dv-feature-grid .tab:nth-child(' + (index + 1) + ') h3', item.title);
      setText('.trust .dv-feature-grid .tab:nth-child(' + (index + 1) + ') p', item.body);
    });

    setText('.faq_side > .label', content.faq.eyebrow);
    setText('.faq_side h2', content.faq.heading, true);
    var faqNote = document.querySelector('.dv-faq-note');
    if (faqNote) faqNote.innerHTML = escapeHtml(content.faq.note).replace('{email}', '<a href="mailto:' + encodeURIComponent(content.site.contactEmail) + '">' + escapeHtml(content.site.contactEmail) + '</a>');
    setImage('.faq_images img:first-child', content.faq.imageOne, content.faq.imageOneAlt);
    setImage('.faq_images img:last-child', content.faq.imageTwo, content.faq.imageTwoAlt);
    document.querySelectorAll('.faq_list .accordion_item').forEach(function (item, index) {
      var faq = content.faq.items[index];
      if (!faq) return;
      setText('.faq_list .accordion_item:nth-child(' + (index + 1) + ') summary h3', faq.question);
      setText('.faq_list .accordion_item:nth-child(' + (index + 1) + ') .accordion_body p', faq.answer);
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      link.href = 'mailto:' + content.site.contactEmail;
      if (!link.querySelector('svg') && link.textContent.indexOf('@') !== -1) link.textContent = content.site.contactEmail;
    });
    var footerBrand = document.querySelector('.footer_brand .label');
    if (footerBrand && content.site.footerTagline) footerBrand.textContent = content.site.footerTagline;
    var instagramLinks = document.querySelectorAll('[data-social-link="instagram"], a[href*="instagram.com"]');
    instagramLinks.forEach(function (link) { link.href = content.site.instagram; });
    var linkedinLinks = document.querySelectorAll('[data-social-link="linkedin"], a[href*="linkedin.com"]');
    linkedinLinks.forEach(function (link) { link.href = content.site.linkedin; });
    setLinkText('.footer_nav-main a[href="#platform"]', content.site.footerPlatformLabel);
    setLinkText('.footer_nav-main a[href="#features"]', content.site.footerFeaturesLabel);
    setLinkText('.footer_nav-main a[href="#founding"]', content.site.footerFoundingLabel);
    setLinkText('.footer_nav-main a[href="#join"]', content.site.footerJoinLabel);
    setLinkText('.footer_nav-small a[href="#health-check"]', content.site.footerHealthLabel);
    setLinkText('.footer_nav-small a[href="#faq"]', content.site.footerFaqLabel);
    setLinkText('.footer_nav-small a[href="/admin"]', content.site.footerAdminLabel);
    setText('.footer_contact > .label', content.site.footerContactLabel);
    setText('.footer_contact > p:nth-of-type(2)', content.site.footerCompanyDetails, true);
    setText('.footer_credentials p:nth-child(1)', content.site.footerCredentialOne, true);
    setText('.footer_credentials p:nth-child(2)', content.site.footerCredentialTwo);
    setText('.footer_credentials p:nth-child(3)', content.site.footerCredentialThree);
    setText('.footer_credits p:last-child', content.site.footerCredit);
    setText('.footer_brand .label', content.site.footerTagline);
    var copyright = document.querySelector('.footer_credits p:first-child');
    if (copyright) {
      var year = String(new Date().getFullYear());
      copyright.innerHTML = escapeHtml(content.site.copyright || '').replace('{year}', '<span data-current-year>' + year + '</span>');
    }
    document.querySelectorAll('.nav_logo, .footer_wordmark').forEach(function (logo) {
      logo.setAttribute('alt', content.site.logoAlt);
    });
    document.querySelectorAll('.nav_brand, .footer_brand a').forEach(function (link) {
      link.setAttribute('aria-label', content.site.logoHomeLabel);
    });

    var structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
      try {
        var data = JSON.parse(structuredData.textContent);
        var graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
        graph.forEach(function (entry) {
          if (entry['@type'] === 'Organization') {
            entry.url = content.site.organizationUrl || content.site.canonicalUrl;
            entry.description = content.site.organizationDescription || content.site.metaDescription;
            entry.email = content.site.organizationEmail || content.site.contactEmail;
          }
          if (entry['@type'] === 'FAQPage' && Array.isArray(content.faq.items)) {
            entry.mainEntity = content.faq.items.map(function (item) {
              return { '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } };
            });
          }
        });
        structuredData.textContent = JSON.stringify(data);
      } catch (error) {}
    }
    return content;
  }

  function save(content) {
    var next = merge(DEFAULT_CONTENT, content || {});
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.domiviseContent = next;
    return next;
  }

  function useContent(next) {
    window.domiviseContent = merge(DEFAULT_CONTENT, next || {});
    apply(window.domiviseContent);
    try {
      window.dispatchEvent(new CustomEvent('domivise-content:updated', { detail: { content: window.domiviseContent } }));
    } catch (error) {}
    return window.domiviseContent;
  }

  function hydratePublished() {
    if (!isSupabaseConfigured() || isAdminPreview() || isAdminPage()) return Promise.resolve(window.domiviseContent);
    return fetchPublished()
      .then(function (remoteContent) {
        return useContent(remoteContent);
      })
      .catch(function () {
        return useContent(loadLocal());
      });
  }

  window.DomiViseContent = {
    STORAGE_KEY: STORAGE_KEY,
    HOMEPAGE_ID: HOMEPAGE_ID,
    DEFAULT_CONTENT: DEFAULT_CONTENT,
    clone: clone,
    merge: merge,
    ensureConfig: ensureConfig,
    isSupabaseConfigured: isSupabaseConfigured,
    load: load,
    loadLocal: loadLocal,
    fetchPublished: fetchPublished,
    save: save,
    saveLocal: save,
    saveRemote: saveRemote,
    useContent: useContent,
    hydratePublished: hydratePublished,
    apply: apply
  };
  window.domiviseContent = load();
  window.applyDomiViseContent = function () { return apply(window.domiviseContent); };
  window.applyDomiViseContent();
  ensureConfig().then(hydratePublished);

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'domivise-content-preview') return;
    useContent(event.data.content || {});
  });
})();
