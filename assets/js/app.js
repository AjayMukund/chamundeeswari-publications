/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — SPA Controller
   app.js  ·  Manages view switching + hover pre-render cache
═══════════════════════════════════════════════════════ */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const RENDER_SCALE = 1.0;   // increase to 1.5–2.0 for sharper text on HiDPI displays
const JPEG_QUALITY = 0.88;  // 0.88 gives ~25% smaller blobs vs 0.95 with no visible loss

/* ── Caches ────────────────────────────────────────── */
const _pageCache     = new Map();  // bookId → pageEls[]
const _promiseCache  = new Map();  // bookId → Promise<pageEls[]>
const _progressState = new Map();  // bookId → { current, total, listeners[] }

/* ── Catalog (set by dashboard.js after fetch) ──────── */
let _catalog = [];

/* ── DOM refs ──────────────────────────────────────── */
const viewDashboard  = document.getElementById('view-dashboard');
const viewViewer     = document.getElementById('view-viewer');
const navDashState   = document.getElementById('nav-dashboard-state');
const navViewerState = document.getElementById('nav-viewer-state');
const viewerLoading  = document.getElementById('viewer-loading');
const loaderBar      = document.getElementById('loader-bar');
const loaderText     = document.getElementById('loader-text');

/* ── Render all pages for a book ────────────────────── */
async function _renderBook(book) {
    const pdf   = await pdfjsLib.getDocument(book.file).promise;
    const total = pdf.numPages;
    const els   = [];

    const state = _progressState.get(book.id);
    if (state) state.total = total;

    for (let i = 1; i <= total; i++) {
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;

        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport
        }).promise;

        // Convert to JPEG blob → img, releasing GPU canvas texture memory
        const blobUrl = await new Promise(resolve =>
            canvas.toBlob(blob => resolve(URL.createObjectURL(blob)), 'image/jpeg', JPEG_QUALITY)
        );

        const img     = document.createElement('img');
        img.src       = blobUrl;
        img.draggable = false;

        const div = document.createElement('div');
        div.className = 'page';
        div.appendChild(img);
        els.push(div);

        if (state) {
            state.current = i;
            state.listeners.forEach(cb => cb(i, total));
        }
    }

    return els;
}

/* ── Start or attach to an existing render ──────────── */
function getOrRender(book) {
    if (_pageCache.has(book.id)) {
        return Promise.resolve(_pageCache.get(book.id));
    }

    if (_promiseCache.has(book.id)) {
        return _promiseCache.get(book.id);
    }

    _progressState.set(book.id, { current: 0, total: 0, listeners: [] });

    const promise = _renderBook(book).then(els => {
        _pageCache.set(book.id, els);
        _promiseCache.delete(book.id);
        _progressState.delete(book.id);
        return els;
    });

    _promiseCache.set(book.id, promise);
    return promise;
}

/* ── Subscribe to live render progress ──────────────── */
function _attachProgress(bookId, cb) {
    const state = _progressState.get(bookId);
    if (!state) return () => {};

    // Fire immediately with whatever has already rendered
    if (state.total > 0) cb(state.current, state.total);

    state.listeners.push(cb);
    return () => {
        const i = state.listeners.indexOf(cb);
        if (i !== -1) state.listeners.splice(i, 1);
    };
}

/* ── View: Dashboard ───────────────────────────────── */
function showDashboard() {
    const returning = !viewViewer.hidden;
    viewViewer.hidden     = true;
    viewDashboard.hidden  = false;
    navViewerState.hidden = true;
    navDashState.hidden   = false;
    document.body.classList.remove('view-viewer');
    document.body.classList.add('view-dashboard');
    document.title = 'Chamundeeswari Publications';
    history.replaceState({}, '', location.pathname);
    if (returning) {
        setTimeout(() => {
            const grid = document.getElementById('books-grid');
            if (grid) { grid.tabIndex = -1; grid.focus(); }
        }, 50);
    }
}

/* ── View: Viewer ──────────────────────────────────── */
function showViewer() {
    viewDashboard.hidden  = true;
    viewViewer.hidden     = false;
    navDashState.hidden   = true;
    navViewerState.hidden = false;
    document.body.classList.remove('view-dashboard');
    document.body.classList.add('view-viewer');
}

/* ── Open a book ───────────────────────────────────── */
async function openBook(book) {
    showViewer();
    history.replaceState({}, '', '?book=' + book.id);

    viewerLoading.hidden   = false;
    loaderBar.style.width  = '0%';
    loaderText.textContent = 'Loading…';

    document.title = `${book.title} — Chamundeeswari Publications`;
    document.getElementById('nav-book-title').textContent = book.title;
    window.plausible?.('Book Opened', { props: { title: book.title, series: book.series } });

    try {
        let pageEls;

        if (_pageCache.has(book.id)) {
            // Already fully rendered — open instantly
            loaderBar.style.width  = '100%';
            loaderText.textContent = 'Opening…';
            pageEls = _pageCache.get(book.id);
            await new Promise(r => setTimeout(r, 180));

        } else {
            // Render is either in-flight (hover started it) or not yet begun.
            // Either way, kick off / attach — then subscribe to live progress.
            loaderBar.style.width  = '6%';
            loaderText.textContent = 'Opening book…';

            const renderPromise = getOrRender(book);

            let _lastProgress = 'Opening book…';

            const detach = _attachProgress(book.id, (i, total) => {
                const pct = Math.round(6 + (i / total) * 90);
                loaderBar.style.width = pct + '%';
                _lastProgress = `Rendering page ${i} of ${total}…`;
                if (!document.hidden) loaderText.textContent = _lastProgress;
            });

            const _onVis = () => {
                loaderText.textContent = document.hidden
                    ? 'Paused — please stay on this tab to continue rendering…'
                    : _lastProgress;
            };
            document.addEventListener('visibilitychange', _onVis);

            pageEls = await renderPromise;
            document.removeEventListener('visibilitychange', _onVis);
            detach();

            loaderBar.style.width  = '100%';
            loaderText.textContent = 'Preparing reader…';
            await new Promise(r => setTimeout(r, 220));
        }

        const savedPage  = Math.max(0, parseInt(localStorage.getItem('cp-progress-' + book.id) || '0', 10));
        const otherBooks = _catalog.filter(b => b.id !== book.id);
        const phonicsEl  = document.getElementById('viewer-phonics');
        if (phonicsEl) phonicsEl.textContent = book.phonicsFocus || '';
        Viewer.build(pageEls, savedPage, book.id, otherBooks, book.title);

        viewerLoading.classList.add('fade-out');
        setTimeout(() => {
            viewerLoading.classList.remove('fade-out');
            viewerLoading.hidden = true;
            document.getElementById('page-input')?.focus();
        }, 600);

    } catch (err) {
        loaderText.textContent     = '⚠ Could not load the book. Please try again.';
        loaderBar.style.background = '#8b1a1a';
        console.error('[App]', err);
    }
}

/* ── Public API ────────────────────────────────────── */
function setCatalog(books) { _catalog = books; }
window.App = { getOrRender, openBook, showDashboard, showViewer, setCatalog };

/* ── Initialise ────────────────────────────────────── */

// Read deep-link param BEFORE showDashboard clears the query string
const _deepLinkId = new URLSearchParams(location.search).get('book');

showDashboard();

/* ── Deep-link: auto-open book from ?book= URL param ── */
(async () => {
    if (!_deepLinkId) return;
    try {
        const { books = [] } = await fetch('books/catalog.json').then(r => r.json());
        const book = books.find(b => b.id === _deepLinkId);
        if (book) openBook(book);
    } catch (_) {}
})();
