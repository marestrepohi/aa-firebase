import type { Metric } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
  icon: React.ReactNode;
}

export function MetricsCard({ title, metrics, icon }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex justify-between items-baseline">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-bold">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  {metric.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>}
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
