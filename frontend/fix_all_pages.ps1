# Global theme-adaptive class replacements for all remaining pages
# Replaces dark-only card surfaces and text with proper light/dark adaptive classes

$pages = @(
    'src\pages\FranchiseDetail.tsx',
    'src\pages\FranchiseCompare.tsx',
    'src\pages\FinancialCalculator.tsx',
    'src\pages\InvestorAdvisor.tsx',
    'src\pages\LocationAnalysis.tsx',
    'src\pages\ScenarioSimulator.tsx',
    'src\pages\WatchlistPage.tsx',
    'src\pages\LoginPage.tsx',
    'src\pages\AdminPortal.tsx'
)

foreach ($file in $pages) {
    if (-not (Test-Path $file)) { continue }
    $c = Get-Content $file -Raw

    # Card surfaces: dark-only -> light/dark adaptive
    $c = $c -replace 'bg-slate-900/30 border border-slate-800/60', 'bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80'
    $c = $c -replace 'bg-slate-900/40 border border-slate-800/60', 'bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/80'
    $c = $c -replace 'bg-slate-900/60 border border-slate-800/80', 'bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80'
    $c = $c -replace 'bg-slate-900/90 border border-slate-800', 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800'
    $c = $c -replace 'bg-slate-900 border border-slate-800', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'

    # Inner box surfaces
    $c = $c -replace 'bg-slate-950/40 border border-slate-800/50', 'bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/60'
    $c = $c -replace 'bg-slate-950/60 border border-slate-800/70', 'bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/70'
    $c = $c -replace 'bg-slate-950/30 border border-slate-800/40', 'bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800/40'

    # Heading text
    $c = $c -replace 'text-xl font-bold text-white', 'text-xl font-bold text-slate-900 dark:text-white'
    $c = $c -replace 'text-2xl font-bold text-white', 'text-2xl font-bold text-slate-900 dark:text-white'
    $c = $c -replace 'text-2xl font-extrabold text-white', 'text-2xl font-extrabold text-slate-900 dark:text-white'
    $c = $c -replace 'text-3xl font-extrabold text-white', 'text-3xl font-extrabold text-slate-900 dark:text-white'
    $c = $c -replace 'text-lg font-bold text-white', 'text-lg font-bold text-slate-900 dark:text-white'
    $c = $c -replace 'text-base font-bold text-white', 'text-base font-bold text-slate-900 dark:text-white'
    $c = $c -replace 'text-sm font-semibold text-white', 'text-sm font-semibold text-slate-900 dark:text-white'
    $c = $c -replace 'text-sm font-bold text-white', 'text-sm font-bold text-slate-900 dark:text-white'

    # Body text
    $c = $c -replace '"text-xs text-slate-400"', '"text-xs text-slate-500 dark:text-slate-400"'
    $c = $c -replace '"text-sm text-slate-400"', '"text-sm text-slate-500 dark:text-slate-400"'
    $c = $c -replace '"text-slate-400 text-xs"', '"text-slate-500 dark:text-slate-400 text-xs"'
    $c = $c -replace 'text-slate-200 font-bold', 'text-slate-900 dark:text-slate-200 font-bold'
    $c = $c -replace '"text-slate-300"', '"text-slate-700 dark:text-slate-300"'

    # Dividers
    $c = $c -replace 'border-slate-800/60', 'border-slate-100 dark:border-slate-800/60'
    $c = $c -replace 'border-slate-800/80', 'border-slate-200 dark:border-slate-800'
    $c = $c -replace 'divide-slate-800/50', 'divide-slate-100 dark:divide-slate-800/50'

    # Hover rows
    $c = $c -replace 'hover:bg-slate-800/25', 'hover:bg-slate-50 dark:hover:bg-slate-800/25'
    $c = $c -replace 'hover:bg-slate-800/40', 'hover:bg-slate-100 dark:hover:bg-slate-800/40'

    # Primary buttons: emerald CTA -> blue
    $c = $c -replace 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold', 'bg-blue-600 hover:bg-blue-500 text-white font-semibold'
    $c = $c -replace 'bg-emerald-500 hover:bg-emerald-400 text-slate-950', 'bg-blue-600 hover:bg-blue-500 text-white'

    # Secondary buttons
    $c = $c -replace '"bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"', '"bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"'

    # Form inputs
    $c = $c -replace 'bg-slate-950 border border-slate-800 rounded-xl', 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg'
    $c = $c -replace 'text-white placeholder-slate-500 focus:border-emerald-500 outline-none', 'text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 outline-none'

    # Spinner color
    $c = $c -replace 'border-emerald-500 border-t-transparent', 'border-blue-600 border-t-transparent'

    # Loading text
    $c = $c -replace '"text-slate-400 text-sm"', '"text-slate-500 dark:text-slate-400 text-sm"'

    Set-Content $file -Value $c -NoNewline
    Write-Host "Updated: $file"
}

Write-Host "All pages updated!"
