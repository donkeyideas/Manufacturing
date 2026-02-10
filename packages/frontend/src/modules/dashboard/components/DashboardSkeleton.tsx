import { Skeleton, SkeletonKPICard } from '@erp/ui';

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-56 mt-2" />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonKPICard />
        <SkeletonKPICard />
        <SkeletonKPICard />
        <SkeletonKPICard />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-surface-1 p-4">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-7 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-md" />
        </div>
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-56 rounded-md" />
        </div>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-surface-1 p-4">
            <Skeleton className="h-5 w-36 mb-4" />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-2/3 mt-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Module Cards */}
      <div>
        <Skeleton className="h-5 w-20 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-surface-1 p-3">
              <Skeleton className="h-8 w-8 rounded-md mb-2" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-24 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
