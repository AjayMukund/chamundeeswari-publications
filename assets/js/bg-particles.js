/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Background Particles v4
   Dark  → 3 types of golden twinkling stars (non-overlapping)
   Light → 3D realistic multi-colour butterflies (non-overlapping)
   Both  → canvas mouse-sparkle / petal trail
═══════════════════════════════════════════════════════ */
(function () {
    var M       = window.innerWidth < 600;
    var NO_ANIM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var CFG = {
        star5: { n: M ? 20 : 38, lo: M ? 8  : 10, hi: M ? 18 : 26 },
        star4: { n: M ? 14 : 26, lo: M ? 6  : 8,  hi: M ? 14 : 20 },
        dot:   { n: M ? 16 : 30, lo: 2,             hi: M ?  4 :  5 },
        bfly:  { n: M ? 12 : 22, lo: M ? 28 : 36,  hi: M ? 44 : 60 },
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

    /* ── 4 realistic wing-shape variants ──────────────────
       All paths use viewBox 0 0 30 52.
       Left wing: body join at x≈28 (right edge).
       Right wing: body join at x≈2  (left edge).
       lv / rv: vein stroke paths radiating from body.
    ─────────────────────────────────────────────────── */
    var BFLY_SHAPES = [
        /* 0 — Monarch: broad rounded upper, tear-drop lower */
        {
            lu: 'M28,22 C21,4 3,1 4,14 C5,24 18,26 28,22Z',
            ll: 'M28,27 C16,27 4,34 5,44 C6,50 18,48 28,27Z',
            ru: 'M2,22 C9,4 27,1 26,14 C25,24 12,26 2,22Z',
            rl: 'M2,27 C14,27 26,34 25,44 C24,50 12,48 2,27Z',
            lo: 0.58,
            lv: ['M28,19 C22,10 14,6 8,8','M27,21 L10,14','M27,22 L7,20',
                 'M27,23 L9,26','M28,28 L15,36','M28,31 L11,44'],
            rv: ['M2,19 C8,10 16,6 22,8','M3,21 L20,14','M3,22 L23,20',
                 'M3,23 L21,26','M2,28 L15,36','M2,31 L19,44'],
        },
        /* 1 — Swallowtail: swept upper, elongated pointed lower */
        {
            lu: 'M28,19 C22,3 4,2 2,12 C1,20 15,22 28,19Z',
            ll: 'M28,25 C19,26 4,33 3,44 C2,51 10,52 28,25Z',
            ru: 'M2,19 C8,3 26,2 28,12 C29,20 15,22 2,19Z',
            rl: 'M2,25 C11,26 26,33 27,44 C28,51 20,52 2,25Z',
            lo: 0.62,
            lv: ['M28,17 C22,8 12,4 6,7','M27,19 L10,12','M27,20 L7,18',
                 'M27,21 L9,24','M28,26 L16,32','M28,29 L10,42','M28,32 L14,50'],
            rv: ['M2,17 C8,8 18,4 24,7','M3,19 L20,12','M3,20 L23,18',
                 'M3,21 L21,24','M2,26 L14,32','M2,29 L20,42','M2,32 L16,50'],
        },
        /* 2 — Blue Morpho: massive sweeping upper, tiny lower */
        {
            lu: 'M28,28 C20,2 0,3 2,17 C3,29 18,33 28,28Z',
            ll: 'M28,32 C22,33 14,39 15,45 C16,49 23,47 28,32Z',
            ru: 'M2,28 C10,2 30,3 28,17 C27,29 12,33 2,28Z',
            rl: 'M2,32 C8,33 16,39 15,45 C14,49 7,47 2,32Z',
            lo: 0.52,
            lv: ['M28,20 C22,8 12,4 6,10','M27,23 L8,16','M27,25 L5,22',
                 'M27,27 L7,30','M28,32 L20,36','M28,34 L16,44'],
            rv: ['M2,20 C8,8 18,4 24,10','M3,23 L22,16','M3,25 L25,22',
                 'M3,27 L23,30','M2,32 L10,36','M2,34 L14,44'],
        },
        /* 3 — Birdwing: long narrow upper, flowing lower */
        {
            lu: 'M28,22 C26,9 10,5 4,12 C1,18 13,23 28,22Z',
            ll: 'M28,26 C16,28 5,36 7,45 C9,51 22,48 28,26Z',
            ru: 'M2,22 C4,9 20,5 26,12 C29,18 17,23 2,22Z',
            rl: 'M2,26 C14,28 25,36 23,45 C21,51 8,48 2,26Z',
            lo: 0.58,
            lv: ['M28,18 C24,8 14,4 8,8','M27,20 L12,11','M27,21 L9,17',
                 'M27,22 L7,23','M28,26 L14,34','M28,29 L10,43'],
            rv: ['M2,18 C6,8 16,4 22,8','M3,20 L18,11','M3,21 L21,17',
                 'M3,22 L23,23','M2,26 L16,34','M2,29 L20,43'],
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
        return null;
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

    /* ── Wing SVG builder — radial highlight + veins ── */
    function wingHTML(veins, pathU, pathL, lo, gradId, hlCx, hlCy, pAR) {
        var vs = veins.map(function (v) {
            return '<path d="' + v + '" fill="none" stroke="currentColor"'
                 + ' stroke-width="0.6" stroke-linecap="round" opacity="0.20"/>';
        }).join('');
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 52"'
             + ' width="100%" height="100%" preserveAspectRatio="' + pAR + '" fill="currentColor">'
             + '<defs>'
             + '<radialGradient id="' + gradId + '" cx="' + hlCx + '" cy="' + hlCy + '" r="0.62">'
             + '<stop offset="0%" stop-color="white" stop-opacity="0.34"/>'
             + '<stop offset="60%" stop-color="white" stop-opacity="0.08"/>'
             + '<stop offset="100%" stop-color="white" stop-opacity="0"/>'
             + '</radialGradient>'
             + '</defs>'
             /* upper wing — base fill + highlight overlay */
             + '<path d="' + pathU + '" opacity="0.88"/>'
             + '<path d="' + pathU + '" fill="url(#' + gradId + ')"/>'
             /* lower wing — dimmer */
             + '<path d="' + pathL + '" opacity="' + lo + '"/>'
             /* veins */
             + vs
             + '</svg>';
    }

    /* ── Butterfly factory ── */
    function makeButterfly() {
        var sz         = Math.round(rnd(CFG.bfly.lo, CFG.bfly.hi));
        var h          = Math.round(sz * 0.85);
        var pos        = tryPlace(93, 90, sz * 0.55);
        if (!pos) return null;

        var shape      = BFLY_SHAPES[Math.floor(Math.random() * BFLY_SHAPES.length)];
        var color      = BFLY_COLORS[Math.floor(Math.random() * BFLY_COLORS.length)];
        /* unique ID prefix — prevents SVG gradient ID collisions across multiple butterflies */
        var uid        = Math.random().toString(36).slice(2, 8);
        var flapDur    = rnd(0.42, 0.90).toFixed(2) + 's';
        var flapOffset = rnd(0, 0.20).toFixed(2) + 's';
        var driftDur   = rnd(7, 14).toFixed(1) + 's';
        var driftDelay = rnd(0, 8).toFixed(1) + 's';

        var el = document.createElement('div');
        el.className = 'bgp bgp-butterfly';
        el.style.cssText = 'width:' + sz + 'px;height:' + h + 'px;'
            + 'left:' + pos.lp + '%;top:' + pos.tp + '%;'
            + 'color:' + color + ';';
        if (!NO_ANIM) {
            el.style.animationDuration = driftDur;
            el.style.animationDelay    = driftDelay;
        }

        /* left wing — highlight near upper-right (body/leading edge) */
        var lw = document.createElement('div');
        lw.className = 'bfly-l';
        if (!NO_ANIM) lw.style.animationDuration = flapDur;
        lw.innerHTML = wingHTML(shape.lv, shape.lu, shape.ll, shape.lo,
                                'lh' + uid, '0.82', '0.24', 'xMaxYMid meet');

        /* right wing — highlight near upper-left (body/leading edge) */
        var rw = document.createElement('div');
        rw.className = 'bfly-r';
        if (!NO_ANIM) {
            rw.style.animationDuration = flapDur;
            rw.style.animationDelay    = flapOffset;
        }
        rw.innerHTML = wingHTML(shape.rv, shape.ru, shape.rl, shape.lo,
                                'rh' + uid, '0.18', '0.24', 'xMinYMid meet');

        /* segmented body — head / thorax / abdomen + antennae */
        var bd = document.createElement('div');
        bd.className = 'bfly-body';
        bd.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -8 20 54"'
          + ' width="18" height="100%" fill="currentColor">'
          /* abdomen — tapered oval */
          + '<ellipse cx="0" cy="26" rx="2.6" ry="12" opacity="0.92"/>'
          /* thorax — wider middle */
          + '<ellipse cx="0" cy="11" rx="3.2" ry="5"  opacity="0.96"/>'
          /* head */
          + '<circle  cx="0" cy="2"  r="3"   opacity="0.95"/>'
          /* antennae */
          + '<path d="M-1,0 Q-9,-4 -11,-9" stroke="currentColor" stroke-width="1.1"'
          + ' fill="none" opacity="0.82" stroke-linecap="round"/>'
          + '<path d="M1,0 Q9,-4 11,-9" stroke="currentColor" stroke-width="1.1"'
          + ' fill="none" opacity="0.82" stroke-linecap="round"/>'
          /* antenna clubs */
          + '<ellipse cx="-11" cy="-9" rx="1.8" ry="2.6" transform="rotate(-30 -11 -9)" opacity="0.82"/>'
          + '<ellipse cx="11"  cy="-9" rx="1.8" ry="2.6" transform="rotate(30 11 -9)"  opacity="0.82"/>'
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
       Mouse-trail canvas — v2
       Dark : additive-blend sparkles (3 shapes, 3 warm tones)
       Light: coloured petals & dots from butterfly palette
       Both : click burst + leader particle + air resistance
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

    /* Dark-mode sparkle colour palette (weighted toward gold) */
    var DARK_COLORS  = ['#fff8d0','#fff8d0','#fcd060','#fcd060','#fcd060','#e89a5c'];
    /* Particle shape types */
    var DARK_TYPES   = ['sparkle4','sparkle4','star5','dot'];
    var LIGHT_TYPES  = ['petal','petal','petal','dot'];

    var pts = [];
    var lastTrailTime = 0;
    var emitCount = 0; /* tracks when to emit a leader */

    /* ── Spawn helper ── */
    function spawnParticle(x, y, vx, vy, dark, leader) {
        var r = Math.random();
        return {
            x: x, y: y,
            vx: vx, vy: vy,
            life:  1,
            decay: leader ? rnd(0.016, 0.026) : rnd(0.030, 0.052),
            size:  leader ? rnd(5.5, 9.0)     : rnd(2.2, 5.0),
            rot:   rnd(0, Math.PI * 2),
            rotv:  rnd(-0.16, 0.16),
            dark:  dark,
            type:  dark
                ? DARK_TYPES[Math.floor(r * DARK_TYPES.length)]
                : LIGHT_TYPES[Math.floor(r * LIGHT_TYPES.length)],
            color: dark
                ? DARK_COLORS[Math.floor(r * DARK_COLORS.length)]
                : BFLY_COLORS[Math.floor(Math.random() * BFLY_COLORS.length)],
        };
    }

    /* ── Move-trail emitter ── */
    document.addEventListener('mousemove', function (e) {
        if (viewerEl && !viewerEl.hidden) return;
        var now = performance.now();
        if (now - lastTrailTime < 16) return;
        lastTrailTime = now;
        emitCount++;

        var dark   = document.documentElement.classList.contains('dark');
        var burst  = 2 + (Math.random() < 0.38 ? 1 : 0);
        var leader = (emitCount % 5 === 0); /* every 5th frame gets a leader */

        for (var i = 0; i < burst; i++) {
            pts.push(spawnParticle(
                e.clientX + rnd(-6, 6),
                e.clientY + rnd(-6, 6),
                rnd(-1.6, 1.6),
                rnd(-3.4, -0.6),
                dark,
                leader && i === 0
            ));
        }
    });

    /* ── Click / tap burst ── */
    document.addEventListener('mousedown', function (e) {
        if (viewerEl && !viewerEl.hidden) return;
        var dark = document.documentElement.classList.contains('dark');
        var N = 16;
        for (var i = 0; i < N; i++) {
            var angle = (i / N) * Math.PI * 2;
            var speed = rnd(2.2, 5.0);
            pts.push(spawnParticle(
                e.clientX, e.clientY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                dark,
                i < 4 /* first 4 rays are leaders */
            ));
        }
    });

    /* ── Draw: 4-pointed sparkle (dark) ── */
    function drawSparkle4(p, sz, a) {
        var o = sz, inn = sz * 0.26;
        ctx.beginPath();
        ctx.moveTo(0, -o);
        ctx.lineTo(inn, -inn); ctx.lineTo(o, 0);
        ctx.lineTo(inn,  inn); ctx.lineTo(0, o);
        ctx.lineTo(-inn, inn); ctx.lineTo(-o, 0);
        ctx.lineTo(-inn,-inn);
        ctx.closePath();
        ctx.fill();
    }

    /* ── Draw: 5-pointed star (dark) ── */
    function drawStar5(p, sz, a) {
        var outer = sz, inner = sz * 0.42;
        ctx.beginPath();
        for (var i = 0; i < 5; i++) {
            var oa = (i * 4 * Math.PI / 5) - Math.PI / 2;
            var ia = ((i * 2 + 1) * Math.PI / 5) - Math.PI / 2;
            if (i === 0) ctx.moveTo(Math.cos(oa) * outer, Math.sin(oa) * outer);
            else          ctx.lineTo(Math.cos(oa) * outer, Math.sin(oa) * outer);
            ctx.lineTo(Math.cos(ia) * inner, Math.sin(ia) * inner);
        }
        ctx.closePath();
        ctx.fill();
    }

    /* ── Draw: oval petal (light) ── */
    function drawPetal(sz) {
        ctx.scale(0.65, 1.9);
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.52, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ── Draw: round dot ── */
    function drawDot(sz) {
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ── Unified particle renderer ── */
    function drawParticle(p, sz, a) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.dark) {
            /* additive blending — overlapping sparks bloom bright */
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = a * 0.92;
            ctx.fillStyle   = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur  = sz * 6;
            if      (p.type === 'star5')    drawStar5(p, sz, a);
            else if (p.type === 'dot')       drawDot(sz);
            else                             drawSparkle4(p, sz, a);
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = a * 0.85;
            ctx.fillStyle   = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur  = sz * 3;
            if (p.type === 'dot') drawDot(sz);
            else                  drawPetal(sz);
        }

        ctx.restore();
    }

    /* ── Animation loop ── */
    function trailLoop() {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over'; /* reset after dark additive batch */

        for (var i = pts.length - 1; i >= 0; i--) {
            var p = pts[i];
            p.life -= p.decay;
            p.x    += p.vx;
            p.y    += p.vy;
            p.vx   *= 0.984;   /* gentle air resistance */
            p.vy   *= 0.984;
            p.vy   += p.dark ? 0.05 : 0.08;  /* gravity — petals fall faster */
            p.rot  += p.rotv;
            if (p.life <= 0) { pts.splice(i, 1); continue; }
            var sz = p.size * (0.4 + 0.6 * p.life); /* partial size shrink */
            var a  = p.life * p.life;                 /* quadratic fade */
            drawParticle(p, sz, a);
        }

        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(trailLoop);
    }
    trailLoop();
})();
