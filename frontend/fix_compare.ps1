# Fix FranchiseCompare.tsx - targeted class replacements
$file = 'src\pages\FranchiseCompare.tsx'
$c = Get-Content $file -Raw

# Empty state heading
$c = $c -replace 'text-2xl font-black text-white">Compare', 'text-2xl font-black text-slate-900 dark:text-white">Compare'

# Empty state description
$c = $c -replace '"text-slate-400 text-sm max-w-lg mx-auto"', '"text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto"'

# Browse catalog button
$c = $c -replace '"px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"', '"px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"'

# Header pill: emerald -> blue
$c = $c -replace 'bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase', 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase'

# Header h1
$c = $c -replace 'text-2xl sm:text-3xl font-black text-white tracking-tight">', 'text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">'

# Clear button
$c = $c -replace '"px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"', '"px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"'

# Add franchise button: emerald ghost -> blue ghost
$c = $c -replace '"px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"', '"px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-blue-200 dark:border-blue-500/20"'

# Table card
$c = $c -replace '"bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto"', '"bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-x-auto"'

# Table header border
$c = $c -replace '"border-b border-slate-800">', '"border-b border-slate-200 dark:border-slate-800">'

# Metrics column header
$c = $c -replace '"py-4 px-4 w-48 text-slate-400 font-semibold uppercase tracking-wider text-\[11px\]"', '"py-4 px-4 w-48 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]"'

# Franchise name in header
$c = $c -replace '"font-bold text-white text-sm hover:text-emerald-400 cursor-pointer transition-colors"', '"font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"'

# Sub-sector text
$c = $c -replace '"text-\[11px\] text-slate-400 mt-0.5"', '"text-[11px] text-slate-500 dark:text-slate-400 mt-0.5"'

# Table body dividers
$c = $c -replace '"divide-y divide-slate-800/60"', '"divide-y divide-slate-100 dark:divide-slate-800/60"'

# Row hover
$c = $c -replace '"hover:bg-slate-800/30"', '"hover:bg-slate-50 dark:hover:bg-slate-800/30"'

# Row label text - primary
$c = $c -replace '"py-3 px-4 font-semibold text-slate-300"', '"py-3 px-4 font-semibold text-slate-700 dark:text-slate-300"'

# Row label text - secondary  
$c = $c -replace '"py-3 px-4 font-semibold text-slate-400"', '"py-3 px-4 font-semibold text-slate-500 dark:text-slate-400"'

# Regular cell values
$c = $c -replace '"py-3 px-4 text-slate-200 font-medium"', '"py-3 px-4 text-slate-800 dark:text-slate-200 font-medium"'
$c = $c -replace '"py-3 px-4 text-slate-300"', '"py-3 px-4 text-slate-700 dark:text-slate-300"'

# Non-best value cells
$c = $c -replace "'text-slate-200'", "'text-slate-800 dark:text-slate-200'"

# Best value badges
$c = $c -replace 'bg-emerald-500/20 text-emerald-300 font-semibold', 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30'

Set-Content $file -Value $c -NoNewline
Write-Host "FranchiseCompare.tsx updated!"
