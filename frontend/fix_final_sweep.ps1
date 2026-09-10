# Final sweep - fix remaining dark-only text/surface patterns across all pages
$pages = @(
    'src\pages\FinancialCalculator.tsx',
    'src\pages\InvestorAdvisor.tsx',
    'src\pages\LocationAnalysis.tsx',
    'src\pages\ScenarioSimulator.tsx',
    'src\pages\WatchlistPage.tsx',
    'src\pages\AdminPortal.tsx',
    'src\pages\FranchiseDetail.tsx',
    'src\components\SectorProfitLeaders.tsx'
)

foreach ($file in $pages) {
    if (-not (Test-Path $file)) { continue }
    $c = Get-Content $file -Raw

    # Headings still showing pure white
    $c = $c -replace 'font-black text-white tracking-tight', 'font-black text-slate-900 dark:text-white tracking-tight'
    $c = $c -replace 'font-extrabold text-white tracking-tight', 'font-extrabold text-slate-900 dark:text-white tracking-tight'
    $c = $c -replace 'font-bold text-white">', 'font-bold text-slate-900 dark:text-white">'
    $c = $c -replace 'font-semibold text-white">', 'font-semibold text-slate-900 dark:text-white">'

    # Section headings h2/h3 text-white
    $c = $c -replace '<h2 className="([^"]*) text-white">', '<h2 className="$1 text-slate-900 dark:text-white">'
    $c = $c -replace '<h3 className="([^"]*) text-white">', '<h3 className="$1 text-slate-900 dark:text-white">'

    # Body text still only dark
    $c = $c -replace '"text-slate-400 mt-', '"text-slate-500 dark:text-slate-400 mt-'
    $c = $c -replace '"text-slate-400 text-', '"text-slate-500 dark:text-slate-400 text-'
    $c = $c -replace '"text-xs text-slate-400 font-', '"text-xs text-slate-500 dark:text-slate-400 font-'

    # Emerald primary CTA -> blue
    $c = $c -replace 'bg-emerald-500 hover:bg-emerald-400 text-slate-950', 'bg-blue-600 hover:bg-blue-500 text-white'
    $c = $c -replace 'bg-emerald-600 hover:bg-emerald-500 text-white', 'bg-blue-600 hover:bg-blue-500 text-white'
    $c = $c -replace 'from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold', 'bg-blue-600 hover:bg-blue-500 text-white font-semibold'

    # Section pill badges
    $c = $c -replace 'rounded-full bg-emerald-500/10 text-emerald-400', 'rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
    $c = $c -replace 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400', 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'

    # Active tab: emerald -> blue  
    $c = $c -replace "border-emerald-500 text-emerald-400", "border-blue-600 text-blue-600 dark:text-blue-400"
    $c = $c -replace "text-emerald-400 bg-emerald-500/5", "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5"

    # Card inner backgrounds
    $c = $c -replace 'bg-slate-950/50 border border-slate-800', 'bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800'
    $c = $c -replace 'bg-slate-950/80 border border-slate-800', 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800'

    # Spinner: emerald -> blue
    $c = $c -replace 'border-emerald-500 border-t-transparent', 'border-blue-600 border-t-transparent'

    Set-Content $file -Value $c -NoNewline
    Write-Host "Swept: $file"
}
Write-Host "Final sweep done!"
