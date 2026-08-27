(function () {
  'use strict';

  // Bellhop-style custom cursor — an orange dot with a trailing ring that
  // swells on interactive elements. Desktop + fine pointer only, and skipped
  // entirely when the visitor prefers reduced motion.

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (reducedMotion || !finePointer) return;

  var dot = document.createElement('span');
  dot.className = 'bell-cursor';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = '<span class="bell-cursor_dot"></span><span class="bell-cursor_ring"></span>';
  document.body.appendChild(dot);

  var dotEl = dot.querySelector('.bell-cursor_dot');
  var ringEl = dot.querySelector('.bell-cursor_ring');

  var x = -100, y = -100;
  var rx = -100, ry = -100;
  var hovering = false;

  var interactive = 'a, button, [data-tab], summary, input, select, textarea, label, [role="button"]';

  window.addEventListener('mousemove', function (e) {
    x = e.clientX;
    y = e.clientY;
    dotEl.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
    if (e.target && e.target.closest && e.target.closest(interactive)) {
      if (!hovering) {
        hovering = true;
        dot.classList.add('is-active');
      }
    } else if (hovering) {
      hovering = false;
      dot.classList.remove('is-active');
    }
  }, { passive: true });

  function loop() {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ringEl.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Hide the native cursor only while we can render our own.
  document.documentElement.classList.add('bell-cursor-active');

  // Scroll-triggered media reveal - a soft clip + settle-in for [data-reveal].
  window.initBellhopMotion = function () {
    if (!window.gsap || !window.ScrollTrigger || reducedMotion || window.bellhopMotionReady) return;
    window.bellhopMotionReady = true;

    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        clipPath: 'inset(14% 10% 14% 10%)',
        scale: 1.05,
        duration: 1.1,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  };

  window.initBellhopMotion();
})();
