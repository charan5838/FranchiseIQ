$file = 'src\pages\ExploreFranchises.tsx'
$c = Get-Content $file -Raw

$c = $c -replace 'border-b border-slate-800 pb-3', 'border-b border-slate-100 dark:border-slate-800 pb-3'
$c = $c -replace 'text-base font-bold text-white">List Your Franchise', 'text-base font-bold text-slate-900 dark:text-white">List Your Franchise'
$c = $c -replace '"text-xs text-slate-400">Add your brand', '"text-xs text-slate-500 dark:text-slate-400">Add your brand'
$c = $c -replace 'text-slate-300 font-medium block mb-1">', 'text-slate-700 dark:text-slate-300 font-medium block mb-1">'
$c = $c -replace 'bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 outline-none', 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none'
$c = $c -replace 'border-t border-slate-800">', 'border-t border-slate-100 dark:border-slate-800">'
$c = $c -replace 'rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer">', 'rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">'
$c = $c -replace 'rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5">', 'rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-60">'
$c = $c -replace 'border-2 border-slate-950 border-t-transparent', 'border-2 border-white border-t-transparent'

Set-Content $file -Value $c -NoNewline
Write-Host "Done"
