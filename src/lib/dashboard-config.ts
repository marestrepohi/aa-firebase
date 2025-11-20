// Dashboard Configuration Types

export type MetricFormat = 'number' | 'currency' | 'percentage' | 'decimal';
export type ChartType = 'bar' | 'line' | 'pie' | 'table' | 'scatter' | 'area';
export type DataSource = 'current' | 'history' | 'segments';
export type Aggregation = 'sum' | 'avg' | 'max' | 'min' | 'count';
export type LayoutType = 'grid' | 'tabs' | 'sections';

export interface KPIConfig {
    id: string;
    title: string;
    metricKey: string; // Key in the CSV data
    format: MetricFormat;
    aggregation?: Aggregation;
    icon?: string; // Lucide icon name
    color?: string;
    description?: string;
}

export interface VisualizationConfig {
    id: string;
    type: ChartType;
    title: string;
    description?: string;
    dataSource: DataSource;
    xAxis?: string; // Column name for X axis
    yAxis?: string[]; // Column names for Y axis
    groupBy?: string; // For segmented data
    filters?: string[];
    chartProps?: Record<string, any>; // Additional chart-specific props
}

export interface FilterConfig {
    id: string;
    columnName: string;
    label: string;
    type: 'select' | 'multiselect' | 'range' | 'date';
    options?: string[];
}

export interface DashboardConfig {
    id: string;
    useCaseId: string;
    name: string;
    layout: LayoutType;
    kpis: KPIConfig[];
    visualizations: VisualizationConfig[];
    filters?: FilterConfig[];
    createdAt?: string;
    updatedAt?: string;
}

// Helper to format values based on format type
export function formatValue(value: number | string, format: MetricFormat): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) return String(value);

    switch (format) {
        case 'currency':
            return `$${(numValue / 1000000).toFixed(1)}M`;
        case 'percentage':
            return `${numValue.toFixed(1)}%`;
        case 'decimal':
            return numValue.toFixed(2);
        case 'number':
        default:
            return numValue.toLocaleString();
    }
}

// Helper to aggregate values
export function aggregateValues(values: number[], aggregation: Aggregation): number {
    if (values.length === 0) return 0;

    switch (aggregation) {
        case 'sum':
            return values.reduce((sum, v) => sum + v, 0);
        case 'avg':
            return values.reduce((sum, v) => sum + v, 0) / values.length;
        case 'max':
            return Math.max(...values);
        case 'min':
            return Math.min(...values);
        case 'count':
            return values.length;
        default:
            return values[0];
    }
}

// Helper to extract value from data using key path
export function getValueByKey(data: any, key: string): any {
    if (!data) return undefined;

    // Support nested keys like "segment.A.clients"
    const keys = key.split('.');
    let value = data;

    for (const k of keys) {
        value = value?.[k];
    }

    return value;
}
