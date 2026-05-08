/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Flip Book Viewer
   viewer.js  ·  Receives pre-rendered pageEls from app.js
═══════════════════════════════════════════════════════ */

/* ── State ─────────────────────────────────────────── */
let flipBook    = null;
let pageEls     = [];
let currentPage = 0;
let totalPages  = 0;
let soundOn     = true;

/* ── DOM refs ──────────────────────────────────────── */
const $            = id => document.getElementById(id);
const bookEl       = $('book');
const bookStage    = $('book-stage');
const totalPagesEl = $('total-pages');
const pageInput    = $('page-input');

/* ── Page turn sound ───────────────────────────────── */
const pageTurnAudio = new Audio('assets/audio/page-turn.mp3');
pageTurnAudio.preload = 'auto';

function playPageTurnSound() {
    if (!soundOn) return;
    try {
        pageTurnAudio.currentTime = 0;
        pageTurnAudio.play().catch(() => {});
    } catch (_) {}
}

/* ── Calculate book display dimensions ──────────────── */
function calcDimensions() {
    const rect    = bookStage.getBoundingClientRect();
    const isFs    = !!document.fullscreenElement;
    const marginW = isFs ? 80 : 110;
    const marginH = isFs ? 10 : 20;
    const avW     = rect.width  - marginW * 2;
    const avH     = rect.height - marginH * 2;

    // 3:4 portrait per page
    const ratio  = 3 / 4;
    const mobile = window.innerWidth < 768;
    const cols   = mobile ? 1 : 2;

    let w = Math.floor(avW / cols);
    let h = Math.round(w / ratio);

    if (h > avH) {
        h = avH;
        w = Math.round(h * ratio);
    }

    return { w, h, mobile };
}

/* ── Build (or rebuild) the flip book ───────────────── */
function buildFlipBook(savedPage = 0) {
    bookEl.innerHTML = '';
    pageEls.forEach(el => bookEl.appendChild(el));

    const { w, h, mobile } = calcDimensions();

    flipBook = new St.PageFlip(bookEl, {
        width:               w,
        height:              h,
        size:                'fixed',
        showCover:           true,
        usePortrait:         mobile,
        startZIndex:         0,
        autoSize:            false,
        maxShadowOpacity:    0.6,
        showPageCorners:     true,
        disableFlipByClick:  false,
        mobileScrollSupport: false,
        swipeDistance:       30,
        flippingTime:        900,
    });

    flipBook.loadFromHTML(bookEl.querySelectorAll('.page'));

    totalPages               = pageEls.length;
    totalPagesEl.textContent = totalPages;
    pageInput.max            = totalPages;

    if (savedPage > 0) {
        setTimeout(() => flipBook.flip(savedPage), 120);
    }

    pageInput.value = savedPage + 1;

    flipBook.on('flip', e => {
        currentPage     = e.data;
        pageInput.value = currentPage + 1;
        playPageTurnSound();
    });

    flipBook.on('changeState', () => {
        pageInput.value = (flipBook.getCurrentPageIndex() || 0) + 1;
    });
}

/* ── Controls ──────────────────────────────────────── */
const prev  = () => flipBook?.flipPrev();
const next  = () => flipBook?.flipNext();
const first = () => { currentPage = 0; flipBook?.flip(0); };
const last  = () => { if (flipBook) { currentPage = totalPages - 1; flipBook.flip(currentPage); } };
const goto  = p => { if (p >= 1 && p <= totalPages) { currentPage = p - 1; flipBook?.flip(currentPage); } };

$('btn-prev').addEventListener('click', prev);
$('btn-next').addEventListener('click', next);
$('btn-prev-tb').addEventListener('click', prev);
$('btn-next-tb').addEventListener('click', next);
$('btn-first').addEventListener('click', first);
$('btn-last').addEventListener('click', last);

pageInput.addEventListener('keydown', e => { if (e.key === 'Enter') goto(parseInt(pageInput.value, 10)); });
pageInput.addEventListener('blur',    ()  => goto(parseInt(pageInput.value, 10)));

/* ── Keyboard ──────────────────────────────────────── */
document.addEventListener('keydown', e => {
    if (!flipBook) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); prev(); }
    if (e.key === 'Home') first();
    if (e.key === 'End')  last();
    if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
});

/* ── Back to Library button ────────────────────────── */
$('btn-back-library').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    flipBook = null;
    pageEls  = [];
    App.showDashboard();
});

/* ── Fullscreen ────────────────────────────────────── */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}

document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    document.body.classList.toggle('is-fullscreen', isFs);
    $('icon-expand').style.display   = isFs ? 'none' : '';
    $('icon-compress').style.display = isFs ? '' : 'none';
    const saved = flipBook ? flipBook.getCurrentPageIndex() : 0;
    setTimeout(() => buildFlipBook(saved), 220);
});

$('btn-fullscreen-nav').addEventListener('click', toggleFullscreen);
$('btn-fullscreen-tb').addEventListener('click',  toggleFullscreen);

/* ── Sound ─────────────────────────────────────────── */
$('btn-sound').addEventListener('click', () => {
    soundOn = !soundOn;
    $('icon-sound-on').style.display  = soundOn ? '' : 'none';
    $('icon-sound-off').style.display = soundOn ? 'none' : '';
    $('btn-sound').classList.toggle('active', !soundOn);
    if (soundOn) pageTurnAudio.load();
});

/* ── Resize handler ────────────────────────────────── */
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (!flipBook) return;
        const saved = flipBook.getCurrentPageIndex() || 0;
        buildFlipBook(saved);
    }, 300);
});

/* ── Public API (called by app.js) ─────────────────── */
window.Viewer = {
    build(els) {
        pageEls     = els;
        currentPage = 0;
        buildFlipBook(0);
    }
};
