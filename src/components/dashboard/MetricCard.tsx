import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'purple' | 'orange';
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  isLoading, 
  color = 'emerald' 
}: MetricCardProps) {
  
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };

  return (
    <Card className={`bg-card backdrop-blur-md border shadow-xl hover:shadow-${color}-500/10 hover:border-${color}-500/30 transition-all duration-300 group`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2">
          {isLoading ? (
            <Skeleton className="h-9 w-28 bg-muted rounded-lg" />
          ) : (
            <div className="flex flex-col gap-1">
                <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
                {subtext && (
                    <p className="text-xs text-muted-foreground">{subtext}</p>
                )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}