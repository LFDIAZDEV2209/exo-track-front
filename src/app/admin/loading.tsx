import { DashboardSkeleton } from '@/shared/components/skeletons';

export default function AdminLoading() {
  return (
    <div className="p-6 animate-in fade-in duration-300">
      <DashboardSkeleton />
    </div>
  );
}
