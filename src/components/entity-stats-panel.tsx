import { Badge } from "@/components/ui/badge";

interface StatusCount {
  label: string;
  count: number;
  color: string;
}

interface EntityStatsPanelProps {
  stats: StatusCount[];
}

export function EntityStatsPanel({ stats }: EntityStatsPanelProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-4">
            <span className={`text-3xl font-bold ${stat.color}`}>{stat.count}</span>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
