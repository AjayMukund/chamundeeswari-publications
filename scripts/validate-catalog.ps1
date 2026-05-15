<#
.SYNOPSIS
    Validates books/catalog.json for Chamundeeswari Publications.
.EXAMPLE
    .\scripts\validate-catalog.ps1
#>

$Root    = Split-Path -Parent $PSScriptRoot
$Catalog = Join-Path $Root "books\catalog.json"

$script:errors   = 0
$script:warnings = 0

function Fail($msg)  { Write-Host ("  x " + $msg) -ForegroundColor Red;    $script:errors++ }
function Warn($msg)  { Write-Host ("  ! " + $msg) -ForegroundColor Yellow; $script:warnings++ }
function Pass($msg)  { Write-Host ("  v " + $msg) -ForegroundColor Green }

Write-Host ""
Write-Host "-- Chamundeeswari Publications - Catalog Validator --" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $Catalog)) {
    Write-Host ("x catalog.json not found at: " + $Catalog) -ForegroundColor Red
    exit 1
}

try {
    $json = Get-Content $Catalog -Raw -Encoding UTF8
    $data = $json | ConvertFrom-Json
} catch {
    Write-Host ("x Could not parse catalog.json: " + $_) -ForegroundColor Red
    exit 1
}

$books = $data.books
if (-not $books) {
    Write-Host 'x catalog.json must have a "books" array.' -ForegroundColor Red
    exit 1
}

Write-Host ("Found " + $books.Count + " book(s)")
Write-Host ""

$seenIds  = @{}
$thisYear = (Get-Date).Year

for ($i = 0; $i -lt $books.Count; $i++) {
    $book = $books[$i]
    Write-Host ("Book " + ($i + 1) + ": " + $book.id) -ForegroundColor White

    # Required string fields
    foreach ($field in @('id','title','file','series','seriesBook','ageRange','description')) {
        $val = $book.$field
        if ([string]::IsNullOrWhiteSpace($val)) {
            Fail ('Missing or empty required field: "' + $field + '"')
        }
    }

    # id format and uniqueness
    if ($book.id) {
        if ($book.id -notmatch '^[a-z0-9-]+$') {
            Fail ('id "' + $book.id + '" must only contain lowercase letters, digits, and hyphens')
        }
        if ($seenIds.ContainsKey($book.id)) {
            Fail ('Duplicate id: "' + $book.id + '"')
        } else {
            $seenIds[$book.id] = $true
            Pass ('id: ' + $book.id)
        }
    }

    # pages
    if (-not ($book.pages -is [int]) -or $book.pages -lt 1) {
        Fail ('"pages" must be a positive integer (got ' + $book.pages + ')')
    } else {
        Pass ('pages: ' + $book.pages)
    }

    # year
    $yr = $book.year
    if (-not ($yr -is [int]) -or $yr -lt 2020 -or $yr -gt ($thisYear + 1)) {
        Fail ('"year" must be between 2020 and ' + ($thisYear + 1) + ' (got ' + $yr + ')')
    } else {
        Pass ('year: ' + $yr)
    }

    # PDF file exists
    if ($book.file) {
        $filePath = Join-Path $Root $book.file
        if (-not (Test-Path $filePath)) {
            Fail ('PDF not found on disk: ' + $book.file)
        } else {
            Pass ('file exists: ' + $book.file)
        }
    }

    # Cover image
    if (-not [string]::IsNullOrWhiteSpace($book.cover)) {
        $coverPath = Join-Path $Root $book.cover
        if (-not (Test-Path $coverPath)) {
            Fail ('Cover image not found on disk: ' + $book.cover)
        } else {
            Pass ('cover exists: ' + $book.cover)
        }
    } else {
        Warn 'No cover set - page 1 of the PDF will be used as fallback'
    }

    # price - if set, must be a positive number
    if ($null -ne $book.price) {
        if (-not ($book.price -is [int]) -or $book.price -lt 1) {
            Fail ('"price" must be a positive integer (got ' + $book.price + ')')
        } else {
            $sym = if ($book.currency -eq 'INR') { 'Rs.' } else { '' }
            Pass ('price: ' + $sym + $book.price)
        }
    }

    # purchaseUrl - if non-empty, must be a valid URL
    if (-not [string]::IsNullOrWhiteSpace($book.purchaseUrl)) {
        try {
            $null = [System.Uri]::new($book.purchaseUrl)
            Pass ('purchaseUrl: ' + $book.purchaseUrl)
        } catch {
            Fail ('purchaseUrl is not a valid URL: "' + $book.purchaseUrl + '"')
        }
    }

    # phonicsFocus - optional
    if ([string]::IsNullOrWhiteSpace($book.phonicsFocus)) {
        Warn '"phonicsFocus" not set - viewer footer will be empty for this book'
    }

    Write-Host ""
}

# Summary
if ($script:errors -eq 0 -and $script:warnings -eq 0) {
    Write-Host ("All " + $books.Count + " book(s) passed with no warnings.") -ForegroundColor Green
} elseif ($script:errors -eq 0) {
    Write-Host ("All " + $books.Count + " book(s) passed - " + $script:warnings + " warning(s). Safe to publish.") -ForegroundColor Yellow
} else {
    Write-Host ($script:errors.ToString() + " error(s), " + $script:warnings.ToString() + " warning(s). Fix errors before pushing.") -ForegroundColor Red
}

Write-Host ""

if ($script:errors -gt 0) { exit 1 } else { exit 0 }
