export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-slate-950 dark:to-slate-900">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 blur-sm animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">ExoTrack</p>
          <p className="text-xs text-muted-foreground animate-pulse">Cargando...</p>
        </div>
      </div>
    </div>
  );
}
