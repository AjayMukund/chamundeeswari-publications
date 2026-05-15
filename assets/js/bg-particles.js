/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Background Particles
   bg-particles.js
   Dark  mode → golden twinkling stars
   Light mode → warm fluttering butterflies
═══════════════════════════════════════════════════════ */
(function () {
    var mobile        = window.innerWidth < 600;
    var STAR_COUNT    = mobile ? 22 : 42;
    var BFLY_COUNT    = mobile ? 8  : 16;
    var STAR_MIN      = mobile ? 6  : 8;
    var STAR_MAX      = mobile ? 15 : 22;
    var BFLY_MIN      = mobile ? 20 : 30;
    var BFLY_MAX      = mobile ? 38 : 58;
    var NO_ANIM       = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── SVG builders ── */
    function starSVG(sz) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz +
               '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
               '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>' +
               '</svg>';
    }

    function butterflySVG(sz) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz +
               '" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">' +
               /* upper wings */
               '<ellipse cx="15" cy="15" rx="13" ry="9"  transform="rotate(-30 15 15)" opacity="0.80"/>' +
               '<ellipse cx="33" cy="15" rx="13" ry="9"  transform="rotate(30 33 15)"  opacity="0.80"/>' +
               /* lower wings */
               '<ellipse cx="13" cy="31" rx="8"  ry="6"  transform="rotate(22 13 31)"  opacity="0.55"/>' +
               '<ellipse cx="35" cy="31" rx="8"  ry="6"  transform="rotate(-22 35 31)" opacity="0.55"/>' +
               /* body */
               '<ellipse cx="24" cy="24" rx="2.2" ry="9.5" opacity="0.95"/>' +
               /* antennae */
               '<line x1="24" y1="15" x2="16" y2="6" stroke="currentColor" stroke-width="1.3" opacity="0.70"/>' +
               '<line x1="24" y1="15" x2="32" y2="6" stroke="currentColor" stroke-width="1.3" opacity="0.70"/>' +
               '<circle cx="16" cy="6"  r="1.6" opacity="0.70"/>' +
               '<circle cx="32" cy="6"  r="1.6" opacity="0.70"/>' +
               '</svg>';
    }

    /* ── Element factories ── */
    function rnd(a, b) { return a + Math.random() * (b - a); }

    function makeStar() {
        var sz  = Math.round(rnd(STAR_MIN, STAR_MAX));
        var el  = document.createElement('div');
        el.className = 'bgp bgp-star';
        el.innerHTML = starSVG(sz);
        var css = 'left:' + rnd(0, 98).toFixed(1) + '%;' +
                  'top:'  + rnd(0, 98).toFixed(1) + '%;' +
                  'width:' + sz + 'px;height:' + sz + 'px;';
        if (!NO_ANIM) {
            css += 'animation-delay:'    + rnd(0, 5).toFixed(2) + 's;' +
                   'animation-duration:' + rnd(2.5, 6).toFixed(2) + 's;';
        }
        el.style.cssText = css;
        return el;
    }

    function makeButterfly() {
        var sz  = Math.round(rnd(BFLY_MIN, BFLY_MAX));
        var el  = document.createElement('div');
        el.className = 'bgp bgp-butterfly';
        el.innerHTML = butterflySVG(sz);
        var css = 'left:' + rnd(0, 94).toFixed(1) + '%;' +
                  'top:'  + rnd(0, 92).toFixed(1) + '%;' +
                  'width:' + sz + 'px;height:' + sz + 'px;';
        if (!NO_ANIM) {
            css += 'animation-delay:'    + rnd(0, 6).toFixed(2) + 's;' +
                   'animation-duration:' + rnd(3.5, 7.5).toFixed(2) + 's;';
        }
        el.style.cssText = css;
        return el;
    }

    /* ── Container ── */
    var container = document.createElement('div');
    container.id = 'bg-particles';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    /* ── Render ── */
    var lastMode = null;

    function render() {
        var isDark = document.documentElement.classList.contains('dark');
        var mode   = isDark ? 'dark' : 'light';
        if (mode === lastMode) return;
        lastMode = mode;

        container.innerHTML = '';
        var count = isDark ? STAR_COUNT : BFLY_COUNT;
        var maker = isDark ? makeStar : makeButterfly;
        for (var i = 0; i < count; i++) {
            container.appendChild(maker());
        }
    }

    render();

    /* React to theme toggle */
    new MutationObserver(render).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });

    /* Hide particles when book viewer is open (index.html only) */
    var viewerEl = document.getElementById('view-viewer');
    if (viewerEl) {
        new MutationObserver(function () {
            container.hidden = !viewerEl.hidden;
        }).observe(viewerEl, { attributes: true, attributeFilter: ['hidden'] });
    }
})();
