/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Background Particles v2
   Dark  → 3 types of golden twinkling stars (88 total)
   Light → amber butterflies with real wing-fold animation
   Both  → canvas mouse-sparkle / petal trail
═══════════════════════════════════════════════════════ */
(function () {
    var M       = window.innerWidth < 600;
    var NO_ANIM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var CFG = {
        star5: { n: M ? 20 : 38, lo: M ? 8  : 10, hi: M ? 18 : 26 },
        star4: { n: M ? 14 : 26, lo: M ? 6  : 8,  hi: M ? 14 : 20 },
        dot:   { n: M ? 16 : 30, lo: 2,             hi: M ?  4 :  5 },
        bfly:  { n: M ? 10 : 20, lo: M ? 40 : 56,  hi: M ? 68 : 96 },
    };

    function rnd(a, b) { return a + Math.random() * (b - a); }

    /* ── SVG builders ── */
    function svg5(sz) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz
             + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
             + '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>'
             + '</svg>';
    }

    function svg4(sz) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz
             + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
             + '<path d="M12,0 L13.8,10.2 L24,12 L13.8,13.8 L12,24 L10.2,13.8 L0,12 L10.2,10.2 Z"/>'
             + '</svg>';
    }

    function svgDot(sz) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz
             + '" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">'
             + '<circle cx="5" cy="5" r="4.5"/>'
             + '</svg>';
    }

    /* ── Star factory ── */
    function makeStar(cls, svgFn, lo, hi) {
        var sz  = Math.round(rnd(lo, hi));
        var el  = document.createElement('div');
        el.className = 'bgp ' + cls;
        el.innerHTML = svgFn(sz);
        var css = 'left:' + rnd(0, 97).toFixed(1) + '%;top:' + rnd(0, 97).toFixed(1) + '%;'
                + 'width:' + sz + 'px;height:' + sz + 'px;';
        if (!NO_ANIM) {
            css += 'animation-delay:'    + rnd(0, 7).toFixed(2) + 's;'
                +  'animation-duration:' + rnd(2.5, 7).toFixed(2) + 's;';
        }
        el.style.cssText = css;
        return el;
    }

    /* ── Butterfly factory ── */
    function makeButterfly() {
        var sz       = Math.round(rnd(CFG.bfly.lo, CFG.bfly.hi));
        var h        = Math.round(sz * 0.82);
        var flapDur  = rnd(0.36, 0.80).toFixed(2) + 's';
        var flapOffset = rnd(0, 0.25).toFixed(2) + 's'; // L/R stagger
        var driftDur   = rnd(6, 12).toFixed(1) + 's';
        var driftDelay = rnd(0, 7).toFixed(1) + 's';

        var el = document.createElement('div');
        el.className = 'bgp bgp-butterfly';
        el.style.cssText = 'width:' + sz + 'px;height:' + h + 'px;'
            + 'left:' + rnd(0, 93).toFixed(1) + '%;top:' + rnd(0, 90).toFixed(1) + '%;';
        if (!NO_ANIM) {
            el.style.animationDuration = driftDur;
            el.style.animationDelay    = driftDelay;
        }

        /* left wing — body-connection point at right edge (x≈28 in 0-30 viewBox) */
        var lw = document.createElement('div');
        lw.className = 'bfly-l';
        if (!NO_ANIM) lw.style.animationDuration = flapDur;
        lw.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 52"'
          + ' width="100%" height="100%" preserveAspectRatio="xMaxYMid meet" fill="currentColor">'
          + '<path d="M28,22 C20,5 2,2 4,15 C6,25 19,26 28,22Z"/>'
          + '<path d="M28,27 C15,27 3,36 5,45 C7,51 20,47 28,27Z" opacity="0.56"/>'
          + '</svg>';

        /* right wing — body-connection point at left edge (x≈2 in 0-30 viewBox) */
        var rw = document.createElement('div');
        rw.className = 'bfly-r';
        if (!NO_ANIM) {
            rw.style.animationDuration = flapDur;
            rw.style.animationDelay    = flapOffset;
        }
        rw.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 52"'
          + ' width="100%" height="100%" preserveAspectRatio="xMinYMid meet" fill="currentColor">'
          + '<path d="M2,22 C10,5 28,2 26,15 C24,25 11,26 2,22Z"/>'
          + '<path d="M2,27 C15,27 27,36 25,45 C23,51 10,47 2,27Z" opacity="0.56"/>'
          + '</svg>';

        /* body + antennae — centred overlay */
        var bd = document.createElement('div');
        bd.className = 'bfly-body';
        bd.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -6 20 50"'
          + ' width="20" height="100%" fill="currentColor">'
          + '<ellipse cx="0" cy="22" rx="2.6" ry="11" opacity="0.95"/>'
          + '<circle  cx="0" cy="10" r="3"    opacity="0.95"/>'
          + '<path d="M0,10 Q-8,3 -10,-3" stroke="currentColor" stroke-width="1.3"'
          + ' fill="none" opacity="0.78" stroke-linecap="round"/>'
          + '<path d="M0,10 Q8,3 10,-3" stroke="currentColor" stroke-width="1.3"'
          + ' fill="none" opacity="0.78" stroke-linecap="round"/>'
          + '<circle cx="-10" cy="-3" r="1.8" opacity="0.78"/>'
          + '<circle cx="10"  cy="-3" r="1.8" opacity="0.78"/>'
          + '</svg>';

        el.appendChild(lw);
        el.appendChild(rw);
        el.appendChild(bd);
        return el;
    }

    /* ── Container ── */
    var container = document.createElement('div');
    container.id  = 'bg-particles';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    var lastMode = null;

    function render() {
        var isDark = document.documentElement.classList.contains('dark');
        var mode   = isDark ? 'dark' : 'light';
        if (mode === lastMode) return;
        lastMode = mode;
        container.innerHTML = '';

        if (isDark) {
            for (var i = 0; i < CFG.star5.n; i++)
                container.appendChild(makeStar('bgp-star5', svg5, CFG.star5.lo, CFG.star5.hi));
            for (var j = 0; j < CFG.star4.n; j++)
                container.appendChild(makeStar('bgp-star4', svg4, CFG.star4.lo, CFG.star4.hi));
            for (var k = 0; k < CFG.dot.n; k++)
                container.appendChild(makeStar('bgp-dot',  svgDot, CFG.dot.lo, CFG.dot.hi));
        } else {
            for (var b = 0; b < CFG.bfly.n; b++)
                container.appendChild(makeButterfly());
        }
    }

    render();

    new MutationObserver(render).observe(document.documentElement, {
        attributes: true, attributeFilter: ['class']
    });

    /* Hide when book viewer is open */
    var viewerEl = document.getElementById('view-viewer');
    if (viewerEl) {
        new MutationObserver(function () {
            container.hidden = !viewerEl.hidden;
        }).observe(viewerEl, { attributes: true, attributeFilter: ['hidden'] });
    }

    /* ══════════════════════════════════════════════════
       Mouse-trail canvas
    ══════════════════════════════════════════════════ */
    if (NO_ANIM) return;

    var canvas = document.createElement('canvas');
    canvas.id  = 'trail-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var W   = canvas.width  = window.innerWidth;
    var H   = canvas.height = window.innerHeight;

    window.addEventListener('resize', function () {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    var pts = [];
    var lastTrailTime = 0;

    document.addEventListener('mousemove', function (e) {
        /* skip trail inside the book viewer */
        if (viewerEl && !viewerEl.hidden) return;

        var now = performance.now();
        if (now - lastTrailTime < 18) return; /* ~55fps throttle */
        lastTrailTime = now;

        var dark  = document.documentElement.classList.contains('dark');
        var burst = 2 + (Math.random() < 0.35 ? 1 : 0);
        for (var i = 0; i < burst; i++) {
            pts.push({
                x:    e.clientX + rnd(-5, 5),
                y:    e.clientY + rnd(-5, 5),
                vx:   rnd(-1.4, 1.4),
                vy:   rnd(-2.8, -0.8),
                life: 1,
                decay: rnd(0.026, 0.046),
                size:  rnd(2.8, 5.5),
                rot:   rnd(0, Math.PI * 2),
                rotv:  rnd(-0.12, 0.12),
                dark:  dark,
            });
        }
    });

    /* 4-pointed sparkle for dark mode */
    function drawSparkle(p, sz, a) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle   = '#fcd060';
        ctx.shadowColor = '#c8763e';
        ctx.shadowBlur  = sz * 4;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        var o = sz, inn = sz * 0.27;
        ctx.beginPath();
        ctx.moveTo(0, -o);
        ctx.lineTo(inn, -inn); ctx.lineTo(o, 0);
        ctx.lineTo(inn, inn);  ctx.lineTo(0, o);
        ctx.lineTo(-inn, inn); ctx.lineTo(-o, 0);
        ctx.lineTo(-inn, -inn);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* oval petal for light mode */
    function drawPetal(p, sz, a) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle   = '#c8763e';
        ctx.shadowColor = 'rgba(200, 118, 62, 0.55)';
        ctx.shadowBlur  = sz * 2.8;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1.0, 1.8);
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function trailLoop() {
        ctx.clearRect(0, 0, W, H);
        for (var i = pts.length - 1; i >= 0; i--) {
            var p = pts[i];
            p.life -= p.decay;
            p.x    += p.vx;
            p.y    += p.vy;
            p.vy   += 0.07;   /* gentle gravity */
            p.rot  += p.rotv;
            if (p.life <= 0) { pts.splice(i, 1); continue; }
            var sz = p.size * p.life;
            var a  = p.life * p.life; /* quadratic fade */
            if (p.dark) drawSparkle(p, sz, a);
            else         drawPetal(p, sz, a);
        }
        requestAnimationFrame(trailLoop);
    }
    trailLoop();
})();
