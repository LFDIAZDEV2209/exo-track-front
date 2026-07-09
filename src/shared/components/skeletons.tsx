import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/60',
        className,
      )}
      {...props}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b border-border/50">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-border/20">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-10 rounded-md ml-auto" />
        </div>
      ))}
    </div>
  );
}

function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Skeleton className="h-5 w-40" />
      <div className="rounded-xl border bg-card p-5 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-border/20 last:border-0">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function UserHomeSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Skeleton className="h-5 w-44" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  StatCardSkeleton,
  TableSkeleton,
  CardGridSkeleton,
  DashboardSkeleton,
  UserHomeSkeleton,
  CustomerDetailSkeleton,
  FormSkeleton,
};
