# Fix LoginPage.tsx - targeted redesign for left column and form card
$file = 'src\pages\LoginPage.tsx'
$c = Get-Content $file -Raw

# Left pill badge - emerald -> blue
$c = $c -replace 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">', 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">'

# Main heading
$c = $c -replace 'text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight', 'text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight'

# Gradient text on heading
$c = $c -replace 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400', 'text-blue-600 dark:text-blue-400'

# Description text
$c = $c -replace '"text-sm text-slate-300 leading-relaxed">', '"text-sm text-slate-600 dark:text-slate-300 leading-relaxed">'

# Bullet icon backgrounds - emerald -> blue
$c = $c -replace 'p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5', 'p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5'

# Bullet headings
$c = $c -replace 'text-xs font-bold text-white">', 'text-xs font-bold text-slate-900 dark:text-white">'

# Bullet descriptions
$c = $c -replace '"text-\[11px\] text-slate-400">', '"text-[11px] text-slate-500 dark:text-slate-400">'

# Demo section border
$c = $c -replace 'border-t border-slate-800 space-y-2', 'border-t border-slate-200 dark:border-slate-800 space-y-2'

# Demo label
$c = $c -replace 'text-\[11px\] font-semibold text-slate-400 uppercase tracking-wider block', 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block'

# Demo buttons hover
$c = $c -replace 'hover:border-emerald-500/40 text-left transition-all', 'hover:border-blue-400 dark:hover:border-blue-500/40 text-left transition-all'

# Demo investor name
$c = $c -replace '"text-xs font-bold text-emerald-400">', '"text-xs font-bold text-blue-600 dark:text-blue-400">'

Set-Content $file -Value $c -NoNewline
Write-Host "LoginPage.tsx updated!"
