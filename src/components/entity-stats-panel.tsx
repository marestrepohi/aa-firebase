import { Users, BarChart, TrendingUp, TrendingDown, DollarSign, Code } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

function StatCard({ label, value, icon, iconBg = "bg-brand/5", iconColor = "text-brand" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-3 border border-neutral-100 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 hover:border-brand/30 transition-all duration-300 flex items-center gap-3 group cursor-default">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 leading-none mb-1 group-hover:text-brand transition-colors">{value}</p>
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none">{label}</p>
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
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <StatCard label="Casos de Uso" value={stats.totalCases} icon={<BarChart className="h-5 w-5" />} />
      <StatCard label="Activos" value={stats.active} icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      <StatCard label="Inactivos" value={stats.inactive} icon={<TrendingDown className="h-5 w-5" />} iconBg="bg-rose-50" iconColor="text-rose-600" />
      <StatCard label="Científicos" value={stats.dataScientists} icon={<Users className="h-5 w-5" />} iconBg="bg-blue-50" iconColor="text-blue-600" />
      <StatCard label="Ingenieros" value={stats.dataEngineers} icon={<Code className="h-5 w-5" />} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
      <StatCard
        label="Impacto"
        value={stats.totalImpact.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        icon={<DollarSign className="h-5 w-5" />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  );
}
