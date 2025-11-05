export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
}

export type UseCaseStatus = 'Development' | 'Deployed' | 'Cancelled' | 'Task Assigned';

export interface UseCase {
  id: string;
  entityId: string;
  name: string;
  description: string;
  status: UseCaseStatus;
  lastUpdated: string;
  metrics: {
    general: Metric[];
    financial: Metric[];
    business: Metric[];
    technical: Metric[];
  };
}

export interface EntityStats {
  active: number;
  total: number;
  scientists: number;
  inDevelopment: number;
  alerts: number;
  totalImpact: number;
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  logo: string;
  subName: string;
  stats: EntityStats;
}

export interface SummaryMetrics {
  totalCases: number;
  entities: number;
  dataScientists: number;
  totalImpact: string;
}
