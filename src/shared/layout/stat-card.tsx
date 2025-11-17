import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}

export function StatCard({ title, value, icon: Icon, trend, colorClass = 'bg-primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-sm font-medium text-muted-foreground">
                {trend}
              </p>
            )}
          </div>
          <div className={cn('rounded-full p-3', colorClass)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
