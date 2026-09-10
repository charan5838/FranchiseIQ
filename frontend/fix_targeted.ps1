# Fix WatchlistPage, FinancialCalculator, InvestorAdvisor targeted patterns
$files = @(
    'src\pages\WatchlistPage.tsx',
    'src\pages\FinancialCalculator.tsx',
    'src\pages\InvestorAdvisor.tsx',
    'src\pages\LocationAnalysis.tsx',
    'src\pages\ScenarioSimulator.tsx',
    'src\pages\AdminPortal.tsx',
    'src\pages\FranchiseDetail.tsx',
    'src\pages\FranchiseCompare.tsx',
    'src\pages\LoginPage.tsx',
    'src\pages\ExploreFranchises.tsx'
)

foreach ($file in $files) {
    if (-not (Test-Path $file)) { continue }
    $c = Get-Content $file -Raw

    # Fix rounded-3xl -> rounded-2xl (too bubbly)
    $c = $c -replace 'rounded-3xl', 'rounded-2xl'

    # Fix card border bottom dividers still dark-only
    $c = $c -replace 'border-b border-slate-800 pb-', 'border-b border-slate-100 dark:border-slate-800 pb-'
    $c = $c -replace 'border-t border-slate-800 pt-', 'border-t border-slate-100 dark:border-slate-800 pt-'
    $c = $c -replace 'border-t border-slate-800"', 'border-t border-slate-100 dark:border-slate-800"'

    # Fix h2 headings still with double text-white / text-slate-400 conflict
    $c = $c -replace 'text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400', 'text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider'

    # Fix inline amber pill for watchlist header (keep amber for watchlist - semantic)
    # Fix notification bell area

    # Fix shadow-xl -> shadow-sm (lighter)
    $c = $c -replace 'shadow-xl', 'shadow-sm'
    $c = $c -replace 'shadow-2xl', 'shadow-md'

    # Fix remaining dark-only text patterns
    $c = $c -replace '"text-white font-', '"text-slate-900 dark:text-white font-'
    $c = $c -replace '"text-white text-', '"text-slate-900 dark:text-white text-'

    # Fix table rows hover
    $c = $c -replace 'hover:bg-slate-800/25', 'hover:bg-slate-50 dark:hover:bg-slate-800/25'
    $c = $c -replace 'hover:bg-slate-800/40', 'hover:bg-slate-100 dark:hover:bg-slate-800/40'

    # Fix value text
    $c = $c -replace 'text-slate-200 font-semibold', 'text-slate-800 dark:text-slate-200 font-semibold'
    $c = $c -replace 'text-slate-200 font-bold', 'text-slate-900 dark:text-slate-200 font-bold'
    $c = $c -replace '"text-slate-200"', '"text-slate-800 dark:text-slate-200"'

    # Fix label text
    $c = $c -replace '"text-\[10px\] text-slate-400', '"text-[10px] text-slate-500 dark:text-slate-400'
    $c = $c -replace '"text-\[11px\] text-slate-400', '"text-[11px] text-slate-500 dark:text-slate-400'

    # Fix inner stat boxes
    $c = $c -replace 'bg-slate-800/60 rounded-xl', 'bg-slate-100 dark:bg-slate-800/60 rounded-lg'
    $c = $c -replace 'bg-slate-800/40 rounded-xl', 'bg-slate-100 dark:bg-slate-800/40 rounded-lg'
    $c = $c -replace 'bg-slate-800/80 rounded-xl', 'bg-slate-100 dark:bg-slate-800/80 rounded-lg'
    $c = $c -replace 'bg-slate-800/30 rounded-xl', 'bg-slate-100 dark:bg-slate-800/30 rounded-lg'
    $c = $c -replace 'bg-slate-800/60 rounded-lg', 'bg-slate-100 dark:bg-slate-800/60 rounded-lg'
    $c = $c -replace 'bg-slate-800/40 rounded-lg', 'bg-slate-100 dark:bg-slate-800/40 rounded-lg'

    # Fix empty state icon boxes
    $c = $c -replace 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400', 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'

    Set-Content $file -Value $c -NoNewline
    Write-Host "Fixed: $file"
}
Write-Host "All targeted fixes done!"
