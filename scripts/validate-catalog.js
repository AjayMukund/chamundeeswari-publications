#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Catalog Validator
   Usage: node scripts/validate-catalog.js
   Exit 0 = all good · Exit 1 = errors found
═══════════════════════════════════════════════════════ */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const CATALOG = path.join(ROOT, 'books', 'catalog.json');

let errors = 0;
let warnings = 0;

function fail(msg)  { console.error('  ✗', msg); errors++; }
function warn(msg)  { console.warn ('  ⚠', msg); warnings++; }
function pass(msg)  { console.log ('  ✓', msg); }

/* ── Parse catalog ──────────────────────────────────── */
console.log('\n── Chamundeeswari Publications · Catalog Validator ──\n');

let catalog;
try {
    catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
} catch (e) {
    console.error('✗ Could not parse catalog.json:', e.message);
    process.exit(1);
}

const books = catalog.books;
if (!Array.isArray(books)) {
    console.error('✗ catalog.json must have a "books" array.');
    process.exit(1);
}

console.log(`Found ${books.length} book(s)\n`);

/* ── Validate each book ─────────────────────────────── */
const ids = new Set();
const thisYear = new Date().getFullYear();

books.forEach((book, i) => {
    console.log(`Book ${i + 1}: ${book.id || '(no id)'}`);

    /* Required string fields */
    for (const field of ['id', 'title', 'file', 'series', 'seriesBook', 'ageRange', 'description']) {
        if (!book[field] || typeof book[field] !== 'string' || !book[field].trim()) {
            fail(`Missing or empty required field: "${field}"`);
        }
    }

    /* id format */
    if (book.id) {
        if (!/^[a-z0-9-]+$/.test(book.id)) {
            fail(`id "${book.id}" must only contain lowercase letters, digits, and hyphens`);
        }
        if (ids.has(book.id)) {
            fail(`Duplicate id: "${book.id}"`);
        } else {
            ids.add(book.id);
            pass(`id: ${book.id}`);
        }
    }

    /* pages */
    if (!Number.isInteger(book.pages) || book.pages < 1) {
        fail(`"pages" must be a positive integer (got ${JSON.stringify(book.pages)})`);
    } else {
        pass(`pages: ${book.pages}`);
    }

    /* year */
    if (!Number.isInteger(book.year) || book.year < 2020 || book.year > thisYear + 1) {
        fail(`"year" must be between 2020 and ${thisYear + 1} (got ${JSON.stringify(book.year)})`);
    } else {
        pass(`year: ${book.year}`);
    }

    /* PDF file exists */
    if (book.file) {
        const filePath = path.join(ROOT, book.file);
        if (!fs.existsSync(filePath)) {
            fail(`PDF not found on disk: ${book.file}`);
        } else {
            pass(`file exists: ${book.file}`);
        }
    }

    /* Cover image exists (if set) */
    if (book.cover && book.cover.trim()) {
        const coverPath = path.join(ROOT, book.cover);
        if (!fs.existsSync(coverPath)) {
            fail(`Cover image not found on disk: ${book.cover}`);
        } else {
            pass(`cover exists: ${book.cover}`);
        }
    } else {
        warn('No cover set — page 1 of the PDF will be used as fallback');
    }

    /* purchaseUrl — if non-empty, must be a valid URL */
    if (book.purchaseUrl && book.purchaseUrl.trim()) {
        try {
            new URL(book.purchaseUrl);
            pass(`purchaseUrl: ${book.purchaseUrl}`);
        } catch {
            fail(`purchaseUrl is not a valid URL: "${book.purchaseUrl}"`);
        }
    }

    /* phonicsFocus — optional, just note if missing */
    if (!book.phonicsFocus) {
        warn('"phonicsFocus" not set — viewer footer will be empty for this book');
    }

    console.log('');
});

/* ── Summary ────────────────────────────────────────── */
if (errors === 0 && warnings === 0) {
    console.log(`✓  All ${books.length} book(s) passed validation with no warnings.\n`);
} else if (errors === 0) {
    console.log(`✓  All ${books.length} book(s) passed — ${warnings} warning(s). Safe to publish.\n`);
} else {
    console.error(`✗  ${errors} error(s), ${warnings} warning(s). Fix errors before pushing.\n`);
}

process.exit(errors > 0 ? 1 : 0);
