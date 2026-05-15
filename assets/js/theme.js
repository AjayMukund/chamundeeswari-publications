/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Theme (dark / light)
   theme.js  ·  Load sync in <head> for zero flash
═══════════════════════════════════════════════════════ */
(function () {
    const KEY = 'cp-theme';

    function apply(dark) {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem(KEY, dark ? 'dark' : 'light');
    }

    function syncButtons() {
        const dark = document.documentElement.classList.contains('dark');
        document.querySelectorAll('.btn-theme').forEach(btn => {
            btn.querySelector('.icon-moon').style.display = dark ? 'none' : '';
            btn.querySelector('.icon-sun').style.display  = dark ? ''     : 'none';
            btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
        });
    }

    // Apply immediately before first paint to avoid flash
    apply(localStorage.getItem(KEY) === 'dark');

    document.addEventListener('DOMContentLoaded', () => {
        syncButtons();
        document.addEventListener('click', e => {
            if (e.target.closest('.btn-theme')) {
                apply(!document.documentElement.classList.contains('dark'));
                syncButtons();
            }
        });

        // Background particles — stars (dark) / butterflies (light)
        var bp = document.createElement('script');
        bp.src = 'assets/js/bg-particles.js';
        document.head.appendChild(bp);
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () =>
            navigator.serviceWorker.register('./sw.js').catch(() => {})
        );
    }
})();
