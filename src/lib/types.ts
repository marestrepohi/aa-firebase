export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
}

export type UseCaseStatus = 
  | 'Entregado - sin uso'
  | 'Deprecado'
  | 'Finalizado - con uso'
  | 'Desarrollo - Pilotaje'
  | 'Desarrollo - Exploración y modelamiento'
  | 'Automatización'
  | 'Consultoria'
  | 'Activo'
  | 'Inactivo'
  | 'Development'
  | 'Deployed'
  | 'Cancelled'
  | 'Task Assigned';

export interface UseCase {
  id: string;
  entityId: string;
  name: string;
  description: string;
  etapa: string;
  status: UseCaseStatus;
  highLevelStatus: 'Activo' | 'Inactivo' | 'Estrategico' | string;
  estadoDesarrolloMante: string;
  subtarea: string;
  idFinanciera: string;
  tipoProyecto: string;
  suite: string;
  tipoDesarrollo: string;
  observaciones?: string;
  sharepoint?: string;
  jira?: string;
  confluenceLink?: string;
  lastUpdated?: string;
  metrics: {
    period?: string;
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
  inactive?: number;
  strategic?: number;
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  logo: string;
  stats: EntityStats;
}

export interface SummaryMetrics {
  totalCases: number;
  entities: number;
  dataScientists: number;
  totalImpact: string;
  totalActive?: number;
  totalInactive?: number;
  totalStrategic?: number;
  totalProjects?: number;
  totalEntities?: number;
  totalScientists?: number;
  totalAlerts?: number;
  statusBreakdown?: Record<string, number>;
}
