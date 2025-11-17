import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendColor?: 'green' | 'red' | 'default';
  colorClass?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendColor = 'default',
  colorClass = 'bg-primary' 
}: StatCardProps) {
  const trendColorClass = {
    green: 'text-green-600',
    red: 'text-red-600',
    default: 'text-muted-foreground',
  }[trendColor];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className={cn('text-sm font-medium', trendColorClass)}>
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
