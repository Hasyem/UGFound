export function ReportCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
      <div className="aspect-[16/10] bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded-md w-3/4" />
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-1/2" />
          <div className="flex justify-between">
            <div className="h-3 bg-slate-100 rounded w-1/4" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReportGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </div>
  )
}
