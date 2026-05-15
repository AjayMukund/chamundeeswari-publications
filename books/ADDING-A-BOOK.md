# Adding a New Book

## Quick Checklist

1. Add the PDF → `books/<book-id>.pdf`
2. Add the cover image → `books/Covers/Cover Page - <Title>.png`
3. Add an entry to `books/catalog.json`
4. Run the validator: `node scripts/validate-catalog.js`
5. Commit and push

---

## Step-by-Step

### 1 · Drop in the PDF

Copy the finished PDF into the `books/` folder:

```
books/
  mango-the-monkey.pdf      ← existing
  pip-the-penguin.pdf       ← existing
  your-new-book.pdf         ← add here
```

The filename should match the book's `id` (see below) for consistency,
but the validator checks the `"file"` field in catalog.json, not the filename.

### 2 · Add a cover image

Cover images go in `books/Covers/`. Use the existing naming convention:

```
Cover Page - Your Book Title.png
```

If you skip this step, the viewer will automatically extract page 1 of the PDF
as the cover thumbnail — it just takes a moment on first load.

### 3 · Update catalog.json

Open `books/catalog.json` and add a new object to the `"books"` array:

```json
{
  "id":          "your-book-id",
  "title":       "Your Book Title",
  "file":        "books/your-book-id.pdf",
  "cover":       "books/Covers/Cover Page - Your Book Title.png",
  "series":      "Series Name",
  "seriesBook":  "Book 2",
  "ageRange":    "Ages 3–6",
  "pages":       33,
  "phonicsFocus":"S sounds · Short vowels · CVC words · AABB rhyme",
  "description": "One or two sentences describing the story.",
  "year":        2026,
  "purchaseUrl": ""
}
```

### 4 · Validate

Run from the project root (requires Node.js):

```
node scripts/validate-catalog.js
```

Fix any errors it reports before continuing. Warnings (no cover, no phonicsFocus)
are safe to publish but worth noting.

### 5 · Commit and push

```
git add books/your-book-id.pdf "books/Covers/Cover Page - ..." books/catalog.json
git commit -m "feat: add Your Book Title"
git push
```

GitHub Pages rebuilds automatically — the book will be live within a minute.

---

## catalog.json Field Reference

| Field          | Required | Type    | Description |
|----------------|----------|---------|-------------|
| `id`           | ✓        | string  | URL-safe slug — lowercase, digits, hyphens only. Used in the deep-link URL: `?book=your-book-id` |
| `title`        | ✓        | string  | Full book title as it appears on the card and in the browser tab |
| `file`         | ✓        | string  | Path relative to the site root: `books/filename.pdf` |
| `cover`        |          | string  | Path to cover image: `books/Covers/Cover Page - Title.png`. Omit or leave `""` to use PDF page 1 |
| `series`       | ✓        | string  | Series name shown as filter pill, e.g. `Jungle Friends` |
| `seriesBook`   | ✓        | string  | Position within the series: `Book 1`, `Book 2`, … |
| `ageRange`     | ✓        | string  | Displayed on the card badge, e.g. `Ages 3–6` |
| `pages`        | ✓        | integer | Total page count (must match the PDF) |
| `phonicsFocus` |          | string  | Shown in the viewer footer, e.g. `P sounds · CVC words · AABB rhyme` |
| `description`  | ✓        | string  | One or two sentences for the library card |
| `year`         | ✓        | integer | Publication year, e.g. `2026` |
| `purchaseUrl`  |          | string  | Full URL to buy the physical book. Leave `""` if not yet listed |

## id Naming Rules

- Lowercase letters, digits, and hyphens **only**
- No spaces, underscores, or special characters
- Must be unique across all books

```
pip-the-penguin          ✓
Pip the Penguin          ✗  (spaces, capitals)
pip_the_penguin          ✗  (underscores)
```

## Series Filter Pills

The series filter on the library page is built automatically from the `"series"` values
in `catalog.json`. It only appears when there are **two or more distinct series**.
Use consistent series names — spelling differences create separate pills.
