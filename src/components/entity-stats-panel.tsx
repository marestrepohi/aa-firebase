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
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`font-medium text-sm ${stat.color}`}>{stat.label}</span>
            <Badge variant="secondary" className="text-lg font-bold">
              {stat.count}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
