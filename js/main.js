(function () {
  'use strict';

  var hasGsap = false;
  var motionReady = false;
  var isDesktop = function () { return window.matchMedia('(min-width: 768px)').matches; };
  var hasScrollTrigger = function () { return hasGsap && typeof window.ScrollTrigger !== 'undefined'; };
  var canAnimate = function () { return hasScrollTrigger() && window.innerWidth >= 768; };

  var lenis = null;
  function startLenis() {
    if (lenis || typeof window.Lenis === 'undefined') return;

    lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.8,
      gestureOrientation: 'vertical',
      normalizeWheel: false,
      smoothTouch: false
    });
    window.lenis = lenis;

    if (hasScrollTrigger()) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  }

  window.initDomiViseMotion = function () {
    hasGsap = typeof window.gsap !== 'undefined';
    startLenis();
    if (motionReady || !canAnimate()) return;

    motionReady = true;
    gsap.registerPlugin(ScrollTrigger);
    initScrollAnimations();
  };

  if (typeof Swiper !== 'undefined') {
    new Swiper('[data-swiper]', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 40,
      speed: 500,
      grabCursor: true,
      keyboard: true,
      navigation: {
        prevEl: '[data-cs-prev]',
        nextEl: '[data-cs-next]'
      }
    });
  } else {
    var prev = document.querySelector('[data-cs-prev]');
    var next = document.querySelector('[data-cs-next]');
    if (prev && next) {
      prev.style.display = 'none';
      next.style.display = 'none';
    }
  }

  var lotties = [];
  if (typeof window.lottie !== 'undefined') {
    document.querySelectorAll('[data-lottie]').forEach(function (el) {
      var anim = lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: el.getAttribute('data-lottie')
      });
      anim.addEventListener('DOMLoaded', function () { anim.play(); });
      var card = el.closest('[data-service]');
      if (card) {
        card.addEventListener('mouseenter', function () { anim.play(); });
        card.addEventListener('mouseleave', function () { anim.stop(); });
      }
      lotties.push(anim);
    });
  }

  var accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    accordion.querySelectorAll('details').forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        accordion.querySelectorAll('details[open]').forEach(function (other) {
          if (other !== item) other.open = false;
        });
        if (lenis && typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
    });
  }

  var year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();

  function splitLines(el) {
    if (el.dataset.split) return Array.prototype.slice.call(el.querySelectorAll('.line-inner'));
    var nodes = Array.prototype.slice.call(el.childNodes);
    var segments = [[]];
    nodes.forEach(function (n) {
      if (n.nodeName === 'BR') segments.push([]);
      else segments[segments.length - 1].push(n);
    });
    el.innerHTML = '';
    var inners = [];
    segments.forEach(function (seg) {
      if (!seg.length) return;
      var mask = document.createElement('span');
      mask.className = 'line';
      var inner = document.createElement('span');
      inner.className = 'line-inner';
      seg.forEach(function (n) { inner.appendChild(n); });
      mask.appendChild(inner);
      el.appendChild(mask);
      inners.push(inner);
    });
    el.dataset.split = '1';
    return inners;
  }

  function initScrollAnimations() {
    if (!canAnimate()) return;

    document.querySelectorAll('[data-lines]').forEach(function (el) {
      var lines = splitLines(el);
      if (!lines.length) return;
      gsap.from(lines, {
        yPercent: 115,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power4.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    document.querySelectorAll('[data-block]').forEach(function (el) {
      gsap.from(el, {
        y: 16,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 95%', once: true }
      });
    });

    document.querySelectorAll('[data-children]').forEach(function (el) {
      gsap.from(el.children, {
        y: 16,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });

    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      gsap.fromTo(el,
        { y: '2rem' },
        {
          y: '-2rem',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      );
    });

    document.querySelectorAll('[data-rule]').forEach(function (el) {
      gsap.from(el, {
        scaleX: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    var cover = document.querySelector('.testimonial_cover');
    if (cover) {
      var media = cover.parentElement.querySelector('img');
      var tl = gsap.timeline({
        scrollTrigger: { trigger: cover.parentElement, start: 'top 75%', once: true }
      });
      tl.to(cover, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.inOut' }, 0)
        .from(media, { scale: 1.15, duration: 1.4, ease: 'power3.out' }, 0);
      gsap.set(cover, { clipPath: 'inset(0 0 0% 0)' });
    }

    var tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(function (tab) {
      ['mouseenter', 'click'].forEach(function (evt) {
        tab.addEventListener(evt, function () {
          tabs.forEach(function (t) { t.classList.remove('is-active'); });
          tab.classList.add('is-active');
        });
      });
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  window.initDomiViseMotion();

  var loader = document.querySelector('[data-loader]');
  function runIntro() {
    if (window.sizeFooterReveal) window.sizeFooterReveal();
    if (hasGsap && loader) {
      if (lenis) lenis.stop();
      var layers = loader.querySelectorAll('.loader_layer');
      var tl = gsap.timeline({
        onComplete: function () {
          loader.remove();
          if (lenis) lenis.start();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }
      });
      tl.to(layers[2], { yPercent: -101, duration: 0.55, ease: 'power4.inOut' })
        .to(layers[1], { yPercent: -101, duration: 0.55, ease: 'power4.inOut' }, '-=0.25')
        .to(layers[0], { yPercent: -101, duration: 0.55, ease: 'power4.inOut' }, '-=0.25');
    } else if (loader) {
      loader.remove();
    }
  }

  // Do not wait for every remote video and image to finish loading. Those
  // assets can keep `window.load` pending for a long time, leaving visitors
  // behind the full-screen loader even though the page itself is ready.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runIntro, { once: true });
  else runIntro();
})();
