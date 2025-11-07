import { Users, BarChart, TrendingUp, TrendingDown, DollarSign, Code } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
    return (
        <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-xl font-bold text-gray-800">{value}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}

interface EntityStatsPanelProps {
  stats: {
    totalCases: number;
    active: number;
    inactive: number;
    dataScientists: number;
    dataEngineers: number;
    totalImpact: number;
  };
}

export function EntityStatsPanel({ stats }: EntityStatsPanelProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Casos de Uso" value={stats.totalCases} icon={<BarChart className="h-5 w-5 text-blue-500" />} />
        <StatCard label="Activos" value={stats.active} icon={<TrendingUp className="h-5 w-5 text-green-500" />} />
        <StatCard label="Inactivos" value={stats.inactive} icon={<TrendingDown className="h-5 w-5 text-red-500" />} />
        <StatCard label="Científicos de Datos" value={stats.dataScientists} icon={<Users className="h-5 w-5 text-indigo-500" />} />
        <StatCard label="Ingenieros de Datos" value={stats.dataEngineers} icon={<Code className="h-5 w-5 text-purple-500" />} />
        <StatCard label="Impacto Financiero" value={stats.totalImpact.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })} icon={<DollarSign className="h-5 w-5 text-amber-500" />} />
      </div>
    </div>
  );
}
