export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
}

export interface Kpi {
  id: string;
  nombre: string;
  descripcion: string;
  tipoValor: 'moneda' | 'número' | 'porcentaje';
  valorEsperado: string;
  valorGenerado: string;
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
  sharepointLink?: string;
  jiraLink?: string;
  confluenceLink?: string;
  lastUpdated?: string;
  ds1?: string;
  ds2?: string;
  ds3?: string;
  ds4?: string;
  de?: string;
  mds?: string;
  mantenimiento?: string;
  horasDs1?: string;
  horasDs2?: string;
  horasDs3?: string;
  horasDs4?: string;
  nivelImpactoFinanciero?: string;
  unidadImpactoFinanciero?: string;
  impactoFinanciero?: string;
  financieroAdl?: string;
  financieroEntidad?: string;
  sponsor?: string;
  mainContact?: string;
  sandbox?: string;
  objetivo?: string;
  solucion?: string;
  dolores?: string;
  riesgos?: string;
  kpis: Kpi[];
  roadmap?: { name: string; completed: boolean }[];
  metrics: {
    period?: string;
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
