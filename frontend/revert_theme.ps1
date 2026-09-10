# Revert light/dark adaptive classes back to original dark theme (emerald + slate-950)
$pages = @(
    'src\pages\Dashboard.tsx',
    'src\pages\ExploreFranchises.tsx',
    'src\pages\FranchiseDetail.tsx',
    'src\pages\FranchiseCompare.tsx',
    'src\pages\FinancialCalculator.tsx',
    'src\pages\InvestorAdvisor.tsx',
    'src\pages\LocationAnalysis.tsx',
    'src\pages\ScenarioSimulator.tsx',
    'src\pages\WatchlistPage.tsx',
    'src\pages\LoginPage.tsx',
    'src\pages\AdminPortal.tsx',
    'src\components\SectorProfitLeaders.tsx',
    'src\components\Navbar.tsx',
    'src\components\Footer.tsx'
)

foreach ($file in $pages) {
    if (-not (Test-Path $file)) { continue }
    $c = Get-Content $file -Raw

    # ---- CARD SURFACES: revert to dark-only ----
    $c = $c -replace 'bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80', 'bg-slate-900/40 border border-slate-800/60'
    $c = $c -replace 'bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/80', 'bg-slate-900/60 border border-slate-800/80'
    $c = $c -replace 'bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80', 'bg-slate-900/60 border border-slate-800/80'
    $c = $c -replace 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800', 'bg-slate-900/60 border border-slate-800'
    $c = $c -replace 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800', 'bg-slate-900/80 border border-slate-800'
    $c = $c -replace 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800', 'bg-slate-900 border border-slate-800'
    $c = $c -replace 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800', 'bg-slate-900/90 border border-slate-800'

    # ---- INNER BOXES: revert ----
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/60', 'bg-slate-950/50 border border-slate-800/60'
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/70', 'bg-slate-950/60 border border-slate-800/70'
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800', 'bg-slate-950/80 border border-slate-800'
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800', 'bg-slate-950 border border-slate-800'
    $c = $c -replace 'bg-slate-50 dark:bg-slate-800/60 rounded-lg', 'bg-slate-800/60 rounded-lg'
    $c = $c -replace 'bg-slate-100 dark:bg-slate-800/60 rounded-lg', 'bg-slate-800/60 rounded-lg'
    $c = $c -replace 'bg-slate-100 dark:bg-slate-800/40 rounded-lg', 'bg-slate-800/40 rounded-lg'
    $c = $c -replace 'bg-slate-100 dark:bg-slate-800/80 rounded-lg', 'bg-slate-800/80 rounded-lg'
    $c = $c -replace 'bg-slate-100 dark:bg-slate-800/30 rounded-lg', 'bg-slate-800/30 rounded-lg'

    # ---- HEADINGS: revert to white ----
    $c = $c -replace 'text-slate-900 dark:text-white tracking-tight', 'text-white tracking-tight'
    $c = $c -replace 'text-slate-900 dark:text-white">', 'text-white">'
    $c = $c -replace 'text-slate-900 dark:text-white font-', 'text-white font-'
    $c = $c -replace 'text-slate-900 dark:text-white text-', 'text-white text-'

    # ---- BODY TEXT: revert ----
    $c = $c -replace 'text-slate-500 dark:text-slate-400">', 'text-slate-400">'
    $c = $c -replace 'text-slate-600 dark:text-slate-300">', 'text-slate-300">'
    $c = $c -replace 'text-slate-600 dark:text-slate-400">', 'text-slate-400">'
    $c = $c -replace 'text-slate-700 dark:text-slate-300">', 'text-slate-300">'
    $c = $c -replace 'text-slate-700 dark:text-slate-200">', 'text-slate-200">'
    $c = $c -replace 'text-slate-800 dark:text-slate-200">', 'text-slate-200">'
    $c = $c -replace 'text-slate-800 dark:text-slate-200 font-', 'text-slate-200 font-'
    $c = $c -replace 'text-slate-900 dark:text-slate-200 font-', 'text-slate-200 font-'
    $c = $c -replace 'text-slate-800 dark:text-white">', 'text-white">'

    # ---- DIVIDERS: revert ----
    $c = $c -replace 'border-slate-100 dark:border-slate-800/60', 'border-slate-800/60'
    $c = $c -replace 'border-slate-100 dark:border-slate-800/80', 'border-slate-800/80'
    $c = $c -replace 'border-slate-200 dark:border-slate-800"', 'border-slate-800"'
    $c = $c -replace 'border-b border-slate-100 dark:border-slate-800', 'border-b border-slate-800'
    $c = $c -replace 'border-t border-slate-100 dark:border-slate-800', 'border-t border-slate-800'
    $c = $c -replace 'divide-slate-100 dark:divide-slate-800/50', 'divide-slate-800/50'
    $c = $c -replace 'divide-slate-100 dark:divide-slate-800/60', 'divide-slate-800/60'
    $c = $c -replace 'divide-slate-100 dark:divide-slate-800/80', 'divide-slate-800/80'

    # ---- HOVER ROWS: revert ----
    $c = $c -replace 'hover:bg-slate-50 dark:hover:bg-slate-800/25', 'hover:bg-slate-800/25'
    $c = $c -replace 'hover:bg-slate-50 dark:hover:bg-slate-800/30', 'hover:bg-slate-800/30'
    $c = $c -replace 'hover:bg-slate-100 dark:hover:bg-slate-800/40', 'hover:bg-slate-800/40'

    # ---- BUTTONS: revert blue CTA -> emerald ----
    $c = $c -replace 'bg-blue-600 hover:bg-blue-500 text-white font-semibold', 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
    $c = $c -replace 'bg-blue-600 hover:bg-blue-500 text-white font-bold', 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'

    # But keep blue for compare active state (semantic)
    # ---- SECONDARY BUTTONS: revert ----
    $c = $c -replace 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300', 'bg-slate-800 hover:bg-slate-700 text-slate-300'
    $c = $c -replace 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700', 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'

    # ---- FORM INPUTS: revert ----
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 outline-none', 'bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none'
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none', 'bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 outline-none'
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 outline-none', 'bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none'

    # ---- ACTIVE TABS: revert blue -> emerald ----
    $c = $c -replace "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5", "border-emerald-500 text-emerald-400 bg-emerald-500/5"
    $c = $c -replace "border-blue-600 text-blue-600 dark:text-blue-400", "border-emerald-500 text-emerald-400"

    # ---- INACTIVE TABS: revert ----
    $c = $c -replace "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600", "border-transparent text-slate-400 hover:text-white hover:border-slate-700"

    # ---- PILL BADGES: revert blue -> emerald ----
    $c = $c -replace 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase', 'bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase'
    $c = $c -replace 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400', 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'

    # ---- SECTOR BADGES: revert ----
    $c = $c -replace 'px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', 'px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300'

    # ---- FRANCHISE NAME HOVER: revert ----
    $c = $c -replace 'group-hover:text-blue-600 dark:group-hover:text-blue-400', 'group-hover:text-emerald-400'

    # ---- "Profile" button: revert ----
    $c = $c -replace 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-800/50', 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-semibold text-xs'

    # ---- Compare active: keep emerald ----
    $c = $c -replace "'bg-blue-600 text-white'", "'bg-emerald-500 text-slate-950 font-bold'"
    $c = $c -replace '"bg-blue-600 text-white"', '"bg-emerald-500 text-slate-950 font-bold"'

    # ---- Watchlist saved button ----
    $c = $c -replace 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40', 'bg-amber-500/20 text-amber-300 border border-amber-500/40'

    # ---- "Add Franchise" button ----
    $c = $c -replace 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-blue-200 dark:border-blue-500/20', 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer'

    # ---- Hero heading gradient: restore ----
    $c = $c -replace '"text-blue-600 dark:text-blue-400">', '"text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">'

    # ---- Filter toolbar: revert ----
    $c = $c -replace 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4', 'bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4'

    # ---- Search/select inputs ----
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors', 'bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none'
    $c = $c -replace 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:border-blue-500 outline-none', 'bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 outline-none'

    # ---- Slider accents ----
    $c = $c -replace 'accent-blue-600', 'accent-emerald-500'
    $c = $c -replace 'accent-emerald-600', 'accent-indigo-500'
    $c = $c -replace 'accent-amber-600', 'accent-amber-500'

    # ---- Slider value colors ----
    $c = $c -replace 'text-blue-600 dark:text-blue-400 font-bold', 'text-emerald-400 font-bold'
    $c = $c -replace 'text-emerald-600 dark:text-emerald-400 font-bold', 'text-indigo-400 font-bold'
    $c = $c -replace 'text-amber-600 dark:text-amber-400 font-bold', 'text-amber-400 font-bold'

    # ---- Login page pill ----
    $c = $c -replace 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">', 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">'
    $c = $c -replace 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5', 'bg-emerald-500/20 text-emerald-400 mt-0.5'

    # ---- Compare empty state icon ----
    $c = $c -replace 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto', 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto'

    # ---- Results header link color ----
    $c = $c -replace 'text-blue-600 dark:text-blue-400 font-semibold hover:underline', 'text-emerald-400 font-semibold hover:underline'

    Set-Content $file -Value $c -NoNewline
    Write-Host "Reverted: $file"
}

Write-Host "All pages reverted to original dark theme!"
