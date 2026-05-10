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
    card.innerHTML = `
        <div class="card-cover">
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

    card.addEventListener('mouseenter', () => { App.getOrRender(book); });
    card.addEventListener('click',      () => { App.openBook(book); });

    const skel = card.querySelector(`#skel-${book.id}`);

    if (book.cover) {
        // Static image — instant load, no PDF.js needed
        const img = document.createElement('img');
        img.src   = book.cover;
        img.alt   = book.title;
        img.onload  = () => skel.replaceWith(img);
        img.onerror = () => extractCoverFromPdf(book.file, `cover_${book.id}`)
                               .then(url => { if (url) { img.src = url; skel.replaceWith(img); } });
    } else {
        // Fallback: render page 1 from PDF
        extractCoverFromPdf(book.file, `cover_${book.id}`).then(url => {
            if (!url) return;
            const img = document.createElement('img');
            img.src = url;
            img.alt = book.title;
            skel.replaceWith(img);
        });
    }

    return card;
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

    } catch (err) {
        grid.innerHTML = '<p class="empty-state">Could not load the library. Please refresh.</p>';
        console.error('[Dashboard]', err);
    }
})();
