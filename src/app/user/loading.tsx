import { UserHomeSkeleton } from '@/shared/components/skeletons';

export default function UserLoading() {
  return (
    <div className="p-6 animate-in fade-in duration-300">
      <UserHomeSkeleton />
    </div>
  );
}
