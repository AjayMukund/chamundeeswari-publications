/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Dashboard
   dashboard.js
═══════════════════════════════════════════════════════ */

const grid      = document.getElementById('books-grid');
const bookCount = document.getElementById('book-count');

/* ── Extract cover thumbnail from PDF page 1 (fallback) ── */
async function extractCoverFromPdf(pdfUrl, cacheKey) {
    const stored = sessionStorage.getItem(cacheKey);
    if (stored) return stored;

    try {
        const pdf      = await pdfjsLib.getDocument(pdfUrl).promise;
        const page     = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        sessionStorage.setItem(cacheKey, dataUrl);
        return dataUrl;
    } catch (e) {
        console.warn('Cover extraction failed for', pdfUrl, e);
        return null;
    }
}

/* ── Build a single book card ──────────────────────── */
function createCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.series = book.series;

    const isNew = book.year >= new Date().getFullYear();

    card.innerHTML = `
        <div class="card-cover">
            ${isNew ? '<span class="badge-new">New</span>' : ''}
            <div class="cover-skeleton" id="skel-${book.id}"></div>
            <div class="card-overlay">
                <button class="overlay-btn">Open Book</button>
            </div>
        </div>
        <div class="card-body">
            <span class="card-series">${book.series} · ${book.seriesBook}</span>
            <h3 class="card-title">${book.title}</h3>
            <p class="card-description">${book.description}</p>
            <div class="card-badges">
                <span class="badge badge-age">${book.ageRange}</span>
                <span class="badge badge-series">${book.pages} pages</span>
            </div>
        </div>
    `;

    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', book.title);
    card.querySelector('.overlay-btn').setAttribute('aria-label', `Open ${book.title}`);

    card.addEventListener('click', () => { App.openBook(book); });

    /* Hover / focus pre-render — start PDF render in the background so
       the book opens instantly (or mostly so) when the user clicks. */
    let _preRenderTimer;
    card.addEventListener('mouseenter', () => {
        _preRenderTimer = setTimeout(() => App.getOrRender(book), 500);
    });
    card.addEventListener('mouseleave', () => clearTimeout(_preRenderTimer));
    card.addEventListener('focusin', () => App.getOrRender(book), { once: true });

    if (book.purchaseUrl) {
        const buyBtn = document.createElement('a');
        buyBtn.className = 'btn-buy';
        buyBtn.href      = book.purchaseUrl;
        buyBtn.target    = '_blank';
        buyBtn.rel       = 'noopener noreferrer';
        buyBtn.textContent = 'Buy Book';
        buyBtn.addEventListener('click', e => {
            e.stopPropagation();
            window.plausible?.('Buy Link', { props: { title: book.title } });
        });
        card.querySelector('.card-body').appendChild(buyBtn);
    }

    const skel = card.querySelector(`#skel-${book.id}`);

    /* Lazy cover load — only fetch when card enters the viewport (+ 300px margin).
       Falls back to extracting page 1 from the PDF if no cover image is set. */
    function _loadCover() {
        if (book.cover) {
            const img   = document.createElement('img');
            img.alt     = book.title;
            img.onload  = () => skel.replaceWith(img);
            img.onerror = () => extractCoverFromPdf(book.file, `cover_${book.id}`)
                                   .then(url => { if (url) { img.src = url; skel.replaceWith(img); } });
            img.src = book.cover;
        } else {
            extractCoverFromPdf(book.file, `cover_${book.id}`).then(url => {
                if (!url) return;
                const img = document.createElement('img');
                img.src   = url;
                img.alt   = book.title;
                skel.replaceWith(img);
            });
        }
    }

    const _coverObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            _loadCover();
            _coverObserver.disconnect();
        }
    }, { rootMargin: '300px' });
    _coverObserver.observe(skel);

    return card;
}

/* ── Series filter pills ───────────────────────────── */
function buildFilters(books) {
    const filtersEl = document.getElementById('library-filters');
    if (!filtersEl) return;

    const seriesList = [...new Set(books.map(b => b.series))];
    if (seriesList.length < 2) return;   // no point filtering with only 1 series

    filtersEl.hidden = false;
    let active = 'All';

    function render() {
        filtersEl.innerHTML = '';
        ['All', ...seriesList].forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'filter-pill' + (s === active ? ' active' : '');
            btn.textContent = s;
            btn.addEventListener('click', () => {
                active = s;
                render();
                document.querySelectorAll('.book-card').forEach(card => {
                    card.hidden = s !== 'All' && card.dataset.series !== s;
                });
            });
            filtersEl.appendChild(btn);
        });
    }

    render();
}

/* ── Boot ──────────────────────────────────────────── */
(async () => {
    try {
        const res     = await fetch('books/catalog.json');
        const catalog = await res.json();
        const books   = catalog.books || [];

        bookCount.textContent = `${books.length} book${books.length !== 1 ? 's' : ''}`;

        if (books.length === 0) {
            grid.innerHTML = '<p class="empty-state">No books in the library yet. Check back soon!</p>';
            return;
        }

        books.forEach(book => grid.appendChild(createCard(book)));
        App.setCatalog(books);
        buildFilters(books);

    } catch (err) {
        grid.innerHTML = '<p class="empty-state">Could not load the library. Please refresh.</p>';
        console.error('[Dashboard]', err);
    }
})();
