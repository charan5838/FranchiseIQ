# Fix FranchiseDetail.tsx - targeted class replacements
$file = 'src\pages\FranchiseDetail.tsx'
$c = Get-Content $file -Raw

# Back button
$c = $c -replace 'text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"', 'text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"'

# Watchlist button inactive state
$c = $c -replace "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700", "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"

# Compare button inactive state
$c = $c -replace "'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'", "'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'"

# Compare button active state (emerald -> blue)
$c = $c -replace "'bg-emerald-500 text-slate-950 font-bold'", "'bg-blue-600 text-white font-bold'"

# Hero banner badges
$c = $c -replace 'rounded-full bg-slate-800 text-slate-300 text-xs font-medium', 'rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium'

# Hero name heading
$c = $c -replace 'text-3xl sm:text-4xl font-black text-white tracking-tight', 'text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight'

# Hero description
$c = $c -replace '"text-slate-300 text-sm mt-3 leading-relaxed"', '"text-slate-600 dark:text-slate-300 text-sm mt-3 leading-relaxed"'

# Hero meta row
$c = $c -replace '"flex flex-wrap items-center gap-6 mt-4 text-xs text-slate-400"', '"flex flex-wrap items-center gap-6 mt-4 text-xs text-slate-500 dark:text-slate-400"'
$c = $c -replace 'strong className="text-slate-200"', 'strong className="text-slate-800 dark:text-slate-200"'

# KPI score badge box
$c = $c -replace 'bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-right min-w-\[140px\]', 'bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-right min-w-[140px]'
$c = $c -replace 'bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-right min-w-\[140px\]', 'bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-right min-w-[140px]'

# Tabs navigation border
$c = $c -replace '"border-b border-slate-800 flex items-center', '"border-b border-slate-200 dark:border-slate-800 flex items-center'

# Active tab: emerald -> blue
$c = $c -replace "'border-emerald-500 text-emerald-400 bg-emerald-500/5'", "'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5'"

# Inactive tab
$c = $c -replace "'border-transparent text-slate-400 hover:text-white hover:border-slate-700'", "'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'"

# Investment card
$c = $c -replace '"bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"', '"bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4"'

# Divide lines in tables
$c = $c -replace 'divide-y divide-slate-800/80 text-xs', 'divide-y divide-slate-100 dark:divide-slate-800/80 text-xs'

# Row labels
$c = $c -replace '"text-slate-400">', '"text-slate-500 dark:text-slate-400">'

# Row values (text-white)
$c = $c -replace '"font-semibold text-white"', '"font-semibold text-slate-900 dark:text-white"'

# Total row box
$c = $c -replace '"py-3 flex justify-between text-sm bg-slate-950/60 px-3 rounded-xl mt-2 font-bold"', '"py-3 flex justify-between text-sm bg-slate-50 dark:bg-slate-950/60 px-3 rounded-lg mt-2 font-bold border border-slate-200 dark:border-transparent"'
$c = $c -replace '"text-white">Total Estimated', '"text-slate-900 dark:text-white">Total Estimated'

Set-Content $file -Value $c -NoNewline
Write-Host "FranchiseDetail.tsx updated!"
