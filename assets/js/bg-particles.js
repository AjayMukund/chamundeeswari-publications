/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Background Particles v3
   Dark  → 3 types of golden twinkling stars (non-overlapping)
   Light → 10-colour, 4-shape butterflies (non-overlapping)
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

    /* ── Butterfly colour palette ── */
    var BFLY_COLORS = [
        '#f5a623',  /* turmeric saffron  */
        '#e8536a',  /* rose / kumkum     */
        '#ff6542',  /* mango coral       */
        '#9b59b6',  /* amethyst violet   */
        '#16a085',  /* peacock teal      */
        '#fcd060',  /* marigold gold     */
        '#2e86de',  /* sapphire blue     */
        '#1dd1a1',  /* jade green        */
        '#ff4757',  /* hibiscus red      */
        '#d4a017',  /* deep amber        */
    ];

    /* ── 4 wing-shape variants ── */
    /* paths in a 0-30 × 0-52 viewBox; body join: left wing x≈28, right wing x≈2 */
    var BFLY_SHAPES = [
        /* Monarch — broad, rounded */
        {
            lu: 'M28,22 C20,5 2,2 4,15 C6,25 19,26 28,22Z',
            ll: 'M28,27 C15,27 3,36 5,45 C7,51 20,47 28,27Z',
            ru: 'M2,22 C10,5 28,2 26,15 C24,25 11,26 2,22Z',
            rl: 'M2,27 C15,27 27,36 25,45 C23,51 10,47 2,27Z',
            lo: 0.56,
        },
        /* Swallowtail — swept upper, elongated pointed lower */
        {
            lu: 'M28,19 C22,3 4,2 2,12 C1,20 15,22 28,19Z',
            ll: 'M28,25 C19,26 4,33 3,44 C2,51 10,52 28,25Z',
            ru: 'M2,19 C8,3 26,2 28,12 C29,20 15,22 2,19Z',
            rl: 'M2,25 C11,26 26,33 27,44 C28,51 20,52 2,25Z',
            lo: 0.62,
        },
        /* Blue Morpho — massive upper wing, tiny lower */
        {
            lu: 'M28,28 C20,2 0,3 2,17 C3,29 18,33 28,28Z',
            ll: 'M28,32 C22,33 14,39 15,45 C16,49 23,47 28,32Z',
            ru: 'M2,28 C10,2 30,3 28,17 C27,29 12,33 2,28Z',
            rl: 'M2,32 C8,33 16,39 15,45 C14,49 7,47 2,32Z',
            lo: 0.50,
        },
        /* Birdwing — long narrow upper, flowing lower */
        {
            lu: 'M28,22 C26,9 10,5 4,12 C1,18 13,23 28,22Z',
            ll: 'M28,26 C16,28 5,36 7,45 C9,51 22,48 28,26Z',
            ru: 'M2,22 C4,9 20,5 26,12 C29,18 17,23 2,22Z',
            rl: 'M2,26 C14,28 25,36 23,45 C21,51 8,48 2,26Z',
            lo: 0.58,
        },
    ];

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

    /* ── Placement registry — prevents overlap ── */
    var placed = [];

    function tryPlace(maxLeft, maxTop, r) {
        var PW = window.innerWidth, PH = window.innerHeight;
        for (var t = 0; t < 80; t++) {
            var lp = rnd(0, maxLeft);
            var tp = rnd(0, maxTop);
            var xp = lp / 100 * PW;
            var yp = tp / 100 * PH;
            var ok = true;
            for (var k = 0; k < placed.length; k++) {
                var dx = xp - placed[k].x;
                var dy = yp - placed[k].y;
                var minD = r + placed[k].r;
                if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
            }
            if (ok) {
                placed.push({ x: xp, y: yp, r: r });
                return { lp: lp.toFixed(1), tp: tp.toFixed(1) };
            }
        }
        return null; /* skip particle if no clear spot found */
    }

    /* ── Star factory ── */
    function makeStar(cls, svgFn, lo, hi) {
        var sz  = Math.round(rnd(lo, hi));
        var pos = tryPlace(97, 97, sz * 0.9);
        if (!pos) return null;
        var el  = document.createElement('div');
        el.className = 'bgp ' + cls;
        el.innerHTML = svgFn(sz);
        var css = 'left:' + pos.lp + '%;top:' + pos.tp + '%;'
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
        var sz         = Math.round(rnd(CFG.bfly.lo, CFG.bfly.hi));
        var h          = Math.round(sz * 0.82);
        var pos        = tryPlace(93, 90, sz * 0.55);
        if (!pos) return null;

        var shape      = BFLY_SHAPES[Math.floor(Math.random() * BFLY_SHAPES.length)];
        var color      = BFLY_COLORS[Math.floor(Math.random() * BFLY_COLORS.length)];
        var flapDur    = rnd(0.36, 0.80).toFixed(2) + 's';
        var flapOffset = rnd(0, 0.25).toFixed(2) + 's';
        var driftDur   = rnd(6, 12).toFixed(1) + 's';
        var driftDelay = rnd(0, 7).toFixed(1) + 's';

        var el = document.createElement('div');
        el.className = 'bgp bgp-butterfly';
        el.style.cssText = 'width:' + sz + 'px;height:' + h + 'px;'
            + 'left:' + pos.lp + '%;top:' + pos.tp + '%;'
            + 'color:' + color + ';';
        if (!NO_ANIM) {
            el.style.animationDuration = driftDur;
            el.style.animationDelay    = driftDelay;
        }

        /* left wing */
        var lw = document.createElement('div');
        lw.className = 'bfly-l';
        if (!NO_ANIM) lw.style.animationDuration = flapDur;
        lw.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 52"'
          + ' width="100%" height="100%" preserveAspectRatio="xMaxYMid meet" fill="currentColor">'
          + '<path d="' + shape.lu + '"/>'
          + '<path d="' + shape.ll + '" opacity="' + shape.lo + '"/>'
          + '</svg>';

        /* right wing */
        var rw = document.createElement('div');
        rw.className = 'bfly-r';
        if (!NO_ANIM) {
            rw.style.animationDuration = flapDur;
            rw.style.animationDelay    = flapOffset;
        }
        rw.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 52"'
          + ' width="100%" height="100%" preserveAspectRatio="xMinYMid meet" fill="currentColor">'
          + '<path d="' + shape.ru + '"/>'
          + '<path d="' + shape.rl + '" opacity="' + shape.lo + '"/>'
          + '</svg>';

        /* body + antennae */
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
        placed = [];

        if (isDark) {
            for (var i = 0; i < CFG.star5.n; i++) {
                var s5 = makeStar('bgp-star5', svg5, CFG.star5.lo, CFG.star5.hi);
                if (s5) container.appendChild(s5);
            }
            for (var j = 0; j < CFG.star4.n; j++) {
                var s4 = makeStar('bgp-star4', svg4, CFG.star4.lo, CFG.star4.hi);
                if (s4) container.appendChild(s4);
            }
            for (var k = 0; k < CFG.dot.n; k++) {
                var dt = makeStar('bgp-dot', svgDot, CFG.dot.lo, CFG.dot.hi);
                if (dt) container.appendChild(dt);
            }
        } else {
            for (var b = 0; b < CFG.bfly.n; b++) {
                var bf = makeButterfly();
                if (bf) container.appendChild(bf);
            }
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
        if (viewerEl && !viewerEl.hidden) return;

        var now = performance.now();
        if (now - lastTrailTime < 18) return;
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
            p.vy   += 0.07;
            p.rot  += p.rotv;
            if (p.life <= 0) { pts.splice(i, 1); continue; }
            var sz = p.size * p.life;
            var a  = p.life * p.life;
            if (p.dark) drawSparkle(p, sz, a);
            else         drawPetal(p, sz, a);
        }
        requestAnimationFrame(trailLoop);
    }
    trailLoop();
})();
