(function () {
  'use strict';

  var sources = [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.23/bundled/lenis.min.js'
  ];

  function notifyMotionReady() {
    if (window.initDomiViseMotion) window.initDomiViseMotion();
    if (window.initBellhopMotion) window.initBellhopMotion();
  }

  function loadNext(index) {
    if (index >= sources.length) {
      notifyMotionReady();
      return;
    }

    var script = document.createElement('script');
    script.src = sources[index];
    script.async = true;
    script.onload = function () {
      notifyMotionReady();
      loadNext(index + 1);
    };
    script.onerror = function () {
      loadNext(index + 1);
    };
    document.head.appendChild(script);
  }

  function start() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function () { loadNext(0); }, { timeout: 1200 });
    } else {
      setTimeout(function () { loadNext(0); }, 300);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
