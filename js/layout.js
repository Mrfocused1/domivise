(function () {
  'use strict';

  var PAGES = {
    '/': 'index.html',
    '/index.html': 'index.html',
    '/privacy': 'privacy.html',
    '/terms': 'terms.html'
  };

  function href(path) {
    return PAGES[path] || path;
  }

  var LOGO_PATHS = '<g transform="matrix(1,0,0,1,17,37)"><g transform="matrix(1,0,0,1,2.0337,62.35)"><path d="M3.4,1.5L1,1.5L1,36.6L9.8,36.6C17.7,36.6 20.4,35.5 22.1,34.5C26.8,31.4 29.3,27.4 29.7,20.5C29.9,12.7 26.3,6.2 19.9,2.8C16.3,1.3 11.9,1.4 3.4,1.5ZM26.2,22.5L13.6,11.6L4.3,19.8L4.4,4.6C13.7,4.6 16.7,4.6 19.8,6.4C23.4,8.7 26.6,12.3 26.2,19.5C26.3,20.7 26.1,22.5 26.2,22.5ZM4.4,33.4L4.4,23.9L13.6,15.6L25.3,25.6C24.8,27.2 22.5,31.2 18.9,32.4L15.8,33.1L15.8,26.3L11.5,26.3C11.5,28.9 11.5,33.4 11.6,33.4L4.4,33.4ZM47.1,10.4C44.5,10.4 41.8,10.8 38.7,13.4C36,16 33.7,19 33.6,23.7C33.6,28.9 36.8,36.8 46.6,36.9C49.8,36.9 52.6,36.4 55.3,33.9C57.8,31.7 59.9,28.1 59.9,23.9C59.9,19.4 58.1,16.1 54.9,13.4C52.7,11.3 49.8,10.5 47.1,10.4ZM46.8,34.1C41.8,33.9 36.9,31 36.7,23.7C36.5,19.5 40.6,13.7 46.6,13.6C51.7,13.5 56.8,17.2 56.8,23.9C56.8,30.6 51.5,34.1 46.8,34.1ZM84.8,16.5C84.5,14.9 82.6,10.4 77.2,10.4C72.8,10.3 68.4,14.9 68.1,15.9L68.1,10.8C67.6,11 65.9,10.9 64.8,10.9C64.9,11.1 64.8,36.7 64.8,36.7L68.1,36.7C68.1,34.1 68.1,27.4 68.2,23.9C68.5,19.5 69.9,15.7 74.7,13.9C77.5,13 81.5,13.5 82.2,18.5C82.6,20.4 82.4,26.1 82.5,36.8L85.5,36.7C85.4,33 85.4,24.9 85.6,22.4C85.9,18.5 87.3,16.7 89.1,15.1C91.9,12.7 97.9,12.2 98.7,17.7C99,20.1 99,26.1 99.1,36.8L102.2,36.7C101.9,29.5 102.1,21.7 101.7,17.5C100.9,10.1 93.5,8.8 89.2,11.5C86.1,13.5 84.9,15.7 84.8,16.5ZM107.1,4L112.8,0.4L117.6,3.6C118.5,4.9 128.8,29.7 128.8,29.6C130.9,24.4 139.5,6.4 140.2,3.9L145.2,0.5L150.7,3.9L150.8,8L145.1,4L143.1,5.4L129.3,36.5C129,36.9 129.1,36.6 128.4,36.7C128,34.9 115.1,6.7 115,5.7L112.9,4.1L107.1,7.8L107.1,4ZM107,10.9L110.3,10.8C110.1,11.7 110.3,35.7 110.4,36.6L107,36.6L107,10.9ZM147.5,10.8L150.8,10.9C150.6,11.3 150.8,36.7 150.7,36.7L147.5,36.6L147.5,10.8ZM167.5,16.3L169.2,14.1C165,9.6 160.2,9 156.9,12.6C155.5,14.3 155.1,16.1 155.9,19C158.1,23.9 164.6,24.4 166.3,28.5C167.7,32.7 162,36.1 156.6,31.3L154.2,33.6C156.3,35.9 157.7,36.9 161.7,36.9C164.1,36.9 166.3,36.4 168.2,33.6C170,30.6 169.3,27 167.4,25C163.4,21.3 158.6,20.5 158,17C157.7,15.1 161.3,10.3 167.5,16.3Z" fill="currentColor"></path></g><g transform="matrix(0.961835,0,0,0.961835,10.5428,63.2392)"><path d="M195,29.2C192.2,33.8 189.2,36.4 183.2,36.4C177.2,36.4 173.4,34.6 171.3,28.6C170.1,25.3 170.4,21.4 171.8,17.9C174,13.9 177.5,10.1 183.2,10.2C190.5,10.2 194.5,15.4 195.5,20.2L195.9,23.8L174,23.7C174.1,27.2 176.2,33.6 182.9,33.6C187.6,33.6 189.9,31.7 192.4,27.6L195,29.2ZM192.6,21.2C191.7,16.6 188.7,13.2 183.4,13.2C178.1,13.2 174.8,17 174,21.2L192.6,21.2Z" fill="currentColor"></path></g></g>';

  var ARROW_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M2 2v6a2 2 0 0 0 2 2h9"/><path d="M9.5 6.5 13 10l-3.5 3.5"/></svg>';

  function btn(label, linkHref, cls, withArrow) {
    return '<a class="btn ' + cls + '" href="' + href(linkHref) + '"><span class="btn_text"><span class="btn_label">' + label + (withArrow ? ' ' + ARROW_SVG + '' : '') + '</span><span class="btn_label is-duplicate" aria-hidden="true">' + label + (withArrow ? ' ' + ARROW_SVG : '') + '</span></span></a>';
  }

  var NAV_LINKS = [
    ['#platform', 'What is DomiVise'],
    ['#features', 'How it helps'],
    ['#founding', 'Founding 100'],
    ['#health-check', 'Health check'],
    ['#faq', 'FAQ']
  ];

  var SECONDARY_LINKS = [
    ['/', 'Home'],
    ['https://instagram.com/domivise', 'Instagram', true],
    ['https://www.linkedin.com/company/domivise-ltd/', 'LinkedIn', true],
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Terms of Use']
  ];

  function currentPath() {
    var p = window.location.pathname.split('/').pop();
    return p === '' ? '/' : '/' + p.replace('.html', '');
  }

  function isActive(path) {
    var cur = currentPath();
    if (path === '/') return cur === '/' || cur === '/index';
    return cur.indexOf(path) === 0;
  }

  var headerHTML =
    '<div class="loader_wrapper" data-loader aria-hidden="true">' +
      '<div class="loader_layer bg-primary-yellow"></div>' +
      '<div class="loader_layer bg-dark-grey"></div>' +
      '<div class="loader_layer bg-black"></div>' +
    '</div>' +
    '<header class="nav" id="nav">' +
      '<div class="nav_inner">' +
        '<a class="nav_brand" href="' + href('/') + '" aria-label="DomiVise logo, click to go to the home page.">' +
          '<img src="img/domivise-logo.svg" class="nav_logo" alt="DomiVise" />' +
        '</a>' +
        '<div class="nav_bar is-open" data-nav-bar>' +
          '<button class="nav_burger" id="navBurger" aria-label="Toggle menu" aria-expanded="false">' +
            '<span class="nav_burger_line"></span>' +
            '<span class="nav_burger_line"></span>' +
            '<span class="nav_burger_line"></span>' +
          '</button>' +
          '<div class="nav_collapse"><div class="nav_collapse-inner">' +
            '<ul class="nav_links">' +
              NAV_LINKS.map(function (l) {
                return '<li><a data-nav-link href="' + l[0] + '">' + l[1] + '</a></li>';
              }).join('') +
            '</ul>' +
          '</div></div>' +
          btn('Join the Founding 100', '#join', 'btn_nav-cta', true) +
        '</div>' +
      '</div>' +
      '<div class="nav_background"></div>' +
      '<div class="nav_overlay" id="navOverlay" data-lenis-prevent>' +
        '<ul class="nav_overlay-ul">' +
          NAV_LINKS.map(function (l) {
            return '<li><a data-overlay-link href="' + l[0] + '">' + l[1] + '</a></li>';
          }).join('') +
        '</ul>' +
        '<ul class="nav_overlay-ul is-secondary">' +
          SECONDARY_LINKS.map(function (l) {
            return '<li><a data-overlay-link href="' + (l[0].indexOf('http') === 0 || l[0].charAt(0) === '#' ? l[0] : href(l[0])) + '"' + (l[2] ? ' target="_blank" rel="noopener"' : '') + '>' + l[1] + '</a></li>';
          }).join('') +
        '</ul>' +
      '</div>' +
    '</header>';

  var footerHTML =
    '<footer class="footer bg-black text-white" data-footer>' +
      '<div class="container footer_top">' +
        '<nav class="footer_nav">' +
          '<ul class="footer_nav-main" data-children>' +
            '<li><a href="#platform">What is DomiVise</a></li><li>/</li>' +
            '<li><a href="#features">How it helps</a></li><li>/</li>' +
            '<li><a href="#founding">Founding 100</a></li><li>/</li>' +
            '<li><a href="#join">Join</a></li>' +
          '</ul>' +
          '<ul class="footer_nav-small" data-children>' +
            '<li><a data-underline href="#health-check">Five-Minute Health Check</a></li>' +
            '<li><a data-underline href="#faq">FAQ</a></li>' +
            '<li><a data-underline href="mailto:hello@domivise.co.uk?subject=Hello%20DomiVise!">hello@domivise.co.uk</a></li>' +
            '<li><a data-underline href="https://instagram.com/domivise" target="_blank" rel="noopener">Instagram</a></li>' +
            '<li><a data-underline href="https://www.linkedin.com/company/domivise-ltd/" target="_blank" rel="noopener">LinkedIn</a></li>' +
            '<li><a data-underline href="admin.html">Admin</a></li>' +
            '<li><a data-underline href="' + href('/privacy') + '">Privacy Policy</a></li>' +
            '<li><a data-underline href="' + href('/terms') + '">Terms of Use</a></li>' +
          '</ul>' +
        '</nav>' +
        '<div class="footer_contact" data-block>' +
          '<p class="label">Contact us</p>' +
          '<a data-underline href="mailto:hello@domivise.co.uk?subject=Hello%20DomiVise!">hello@domivise.co.uk</a>' +
          '<p>DomiVise Ltd<br />Company No. 17415511<br />Registered in England and Wales<br />Supporting landlords across the United Kingdom</p>' +
          '<div class="footer_credentials">' +
            '<div>' +
              '<p>Built for landlords across the UK.<br />Guidance tailored to England, Wales, Scotland and Northern Ireland.</p>' +
              '<p>&ldquo;Registered in England and Wales&rdquo; refers to the company&rsquo;s legal registration and does not limit DomiVise&rsquo;s UK-wide service coverage.</p>' +
              '<p>Product in active development &mdash; founding members get first access.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="footer_credits container">' +
        '<p>&copy; <span data-current-year>2026</span> DomiVise Ltd. All rights reserved.</p>' +
        '<p>Intelligent property management for landlords across the UK.</p>' +
      '</div>' +
      '<div class="footer_brand bg-primary-yellow text-dark-grey">' +
        '<div class="container">' +
          '<p class="label" data-block>The calmer home for your rental portfolio</p>' +
          '<a href="' + href('/') + '" aria-label="DomiVise logo, click to go to the home page.">' +
            '<img src="img/domivise-logo.svg" class="footer_wordmark" alt="DomiVise" />' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</footer>';

  var tmp = document.createElement('div');
  tmp.innerHTML = headerHTML;
  var headerEl = tmp.querySelector('.nav');
  var loaderEl = tmp.querySelector('[data-loader]');
  document.body.prepend(loaderEl);
  document.body.prepend(headerEl);

  function dismissLoader() {
    if (loaderEl && loaderEl.isConnected) loaderEl.remove();
  }

  window.dismissDomiViseLoader = dismissLoader;
  setTimeout(dismissLoader, 100);

  tmp.innerHTML = footerHTML;
  document.body.appendChild(tmp.querySelector('[data-footer]'));

  if (window.applyDomiViseContent) window.applyDomiViseContent();

  var year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();

  var nav = document.getElementById('nav');
  var bar = document.querySelector('[data-nav-bar]');
  var burger = document.getElementById('navBurger');

  window.setMobileMenu = function (open) {
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-locked', open);
    if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
  };

  var isDesktop = function () { return window.matchMedia('(min-width: 768px)').matches; };
  var pinned = false;
  var hovering = false;

  function syncBar() {
    var atTop = window.scrollY < 120;
    bar.classList.toggle('is-open', isDesktop() ? (atTop || hovering || pinned) : false);
    burger.setAttribute('aria-expanded', bar.classList.contains('is-open') || nav.classList.contains('menu-open') ? 'true' : 'false');
  }

  if (burger) {
    burger.addEventListener('click', function () {
      if (!isDesktop()) {
        window.setMobileMenu(!nav.classList.contains('menu-open'));
        return;
      }
      pinned = !pinned;
      syncBar();
    });
  }

  if (bar) {
    bar.addEventListener('mouseenter', function () { hovering = true; syncBar(); });
    bar.addEventListener('mouseleave', function () { hovering = false; syncBar(); });
  }

  window.addEventListener('scroll', syncBar, { passive: true });
  if (window.lenis) window.lenis.on('scroll', syncBar);
  syncBar();

  document.querySelectorAll('[data-nav-link], [data-overlay-link]').forEach(function (link) {
    link.addEventListener('click', function () {
      pinned = false;
      window.setMobileMenu(false);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('menu-open')) window.setMobileMenu(false);
    pinned = false;
    syncBar();
  });

  var footer = document.querySelector('[data-footer]');
  var wrapper = document.querySelector('.page-wrapper');
  window.sizeFooterReveal = function () {
    if (!footer || !wrapper) return;
    footer.classList.remove('is-fixed');
    wrapper.style.marginBottom = '';
  };
  window.sizeFooterReveal();
  if (footer && 'ResizeObserver' in window) {
    var footerObserver = new ResizeObserver(function () {
      window.sizeFooterReveal();
    });
    footerObserver.observe(footer);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(window.sizeFooterReveal);
  }
  window.addEventListener('load', window.sizeFooterReveal, { once: true });
  window.addEventListener('resize', function () {
    syncBar();
    window.sizeFooterReveal();
  });
})();
