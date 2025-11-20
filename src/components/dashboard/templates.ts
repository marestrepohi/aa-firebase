import type { DashboardConfig } from '@/lib/dashboard-config';

// Cobranzas Dashboard Template
export const cobranzasTemplate: DashboardConfig = {
    id: 'cobranzas-template',
    useCaseId: '', // Will be filled when applied to a specific use case
    name: 'Dashboard de Cobranzas',
    layout: 'tabs',

    kpis: [
        {
            id: 'kpi-total-clientes',
            title: 'Total Clientes',
            metricKey: 'totalClientes',
            format: 'number',
            aggregation: 'sum',
            icon: 'Users',
            description: 'Total de clientes en cartera'
        },
        {
            id: 'kpi-tasa-exito',
            title: 'Tasa de Éxito',
            metricKey: 'tasaExito',
            format: 'percentage',
            aggregation: 'avg',
            icon: 'Percent',
            description: 'Promedio por segmento'
        },
        {
            id: 'kpi-saldo-total',
            title: 'Saldo Total',
            metricKey: 'saldoTotal',
            format: 'currency',
            aggregation: 'sum',
            icon: 'DollarSign',
            description: 'Millones de pesos'
        },
        {
            id: 'kpi-tasa-recuperacion',
            title: 'Tasa Recuperación',
            metricKey: 'tasaRecuperacion',
            format: 'percentage',
            aggregation: 'avg',
            icon: 'TrendingUp',
            description: 'Últimos 3 meses'
        }
    ],

    visualizations: [
        {
            id: 'viz-rendimiento-segmento',
            type: 'bar',
            title: 'Rendimiento por Segmento',
            description: 'Tasa de éxito por segmento de clientes',
            dataSource: 'current',
            xAxis: 'segmento',
            yAxis: ['tasaExito']
        },
        {
            id: 'viz-distribucion-clientes',
            type: 'bar',
            title: 'Distribución de Clientes',
            description: 'Por segmento de cartera',
            dataSource: 'current',
            xAxis: 'segmento',
            yAxis: ['clientes']
        },
        {
            id: 'viz-tabla-segmentos',
            type: 'table',
            title: 'Desglose Detallado por Segmento',
            description: 'Métricas completas de cada segmento',
            dataSource: 'current',
            xAxis: 'segmento',
            yAxis: ['clientes', 'tasaExito', 'saldoTotal', 'pagos3M', 'tasaRecup']
        },
        {
            id: 'viz-evolucion-temporal',
            type: 'line',
            title: 'Evolución Temporal',
            description: 'Tendencia histórica de métricas clave',
            dataSource: 'history',
            xAxis: 'fecha',
            yAxis: ['clientes', 'tasaExito']
        }
    ]
};

// General Purpose Template (can be customized for any use case)
export const generalTemplate: DashboardConfig = {
    id: 'general-template',
    useCaseId: '',
    name: 'Dashboard General',
    layout: 'grid',

    kpis: [
        {
            id: 'kpi-1',
            title: 'Métrica Principal',
            metricKey: 'metricaPrincipal', // Usuario debe mapear esto
            format: 'number',
            icon: 'Activity'
        }
    ],

    visualizations: [
        {
            id: 'viz-general-1',
            type: 'bar',
            title: 'Vista General',
            dataSource: 'current',
            xAxis: 'categoria',
            yAxis: ['valor']
        }
    ]
};

// Backtesting Template
export const backtestingTemplate: DashboardConfig = {
    id: 'backtesting-template',
    useCaseId: '',
    name: 'Dashboard de Backtesting',
    layout: 'tabs',

    kpis: [
        {
            id: 'kpi-accuracy',
            title: 'Accuracy',
            metricKey: 'accuracy',
            format: 'percentage',
            icon: 'Target'
        },
        {
            id: 'kpi-precision',
            title: 'Precision',
            metricKey: 'precision',
            format: 'percentage',
            icon: 'Crosshair'
        },
        {
            id: 'kpi-recall',
            title: 'Recall',
            metricKey: 'recall',
            format: 'percentage',
            icon: 'Search'
        },
        {
            id: 'kpi-f1',
            title: 'F1 Score',
            metricKey: 'f1Score',
            format: 'decimal',
            icon: 'Award'
        }
    ],

    visualizations: [
        {
            id: 'viz-metricas-modelo',
            type: 'bar',
            title: 'Métricas del Modelo',
            description: 'Accuracy, Precision, Recall',
            dataSource: 'current',
            xAxis: 'metrica',
            yAxis: ['valor']
        },
        {
            id: 'viz-confusion-matrix',
            type: 'table',
            title: 'Matriz de Confusión',
            dataSource: 'current',
            xAxis: 'prediccion',
            yAxis: ['tp', 'fp', 'tn', 'fn']
        },
        {
            id: 'viz-evolucion-metricas',
            type: 'line',
            title: 'Evolución de Métricas',
            description: 'Tendencia de accuracy y precision',
            dataSource: 'history',
            xAxis: 'fecha',
            yAxis: ['accuracy', 'precision', 'recall']
        }
    ]
};

// Export all templates
export const DASHBOARD_TEMPLATES = {
    cobranzas: cobranzasTemplate,
    backtesting: backtestingTemplate,
    general: generalTemplate
};

// Helper to get template by ID
export function getDashboardTemplate(templateId: keyof typeof DASHBOARD_TEMPLATES): DashboardConfig {
    return DASHBOARD_TEMPLATES[templateId];
}
