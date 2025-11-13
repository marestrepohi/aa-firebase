import type { Metric } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsCardProps {
  title: string;
  metrics: Record<string, string | number>;
  descriptions: Record<string, string>;
  icon: React.ReactNode;
}

export function MetricsCard({ title, metrics, descriptions, icon }: MetricsCardProps) {
  const metricEntries = Object.entries(metrics || {});

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {metricEntries.length > 0 ? (
          <div className="space-y-4">
            {metricEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between items-baseline">
                <p className="text-sm text-muted-foreground" title={descriptions[key] || ''}>{key}</p>
                <p className="text-lg font-bold">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No metrics available.</p>
        )}
      </CardContent>
    </Card>
  );
}
