import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string | number;
  action?: React.ReactNode;
}

export function SummaryCard({ title, value, action }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}
