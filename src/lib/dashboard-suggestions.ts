import type { DashboardConfig, KPIConfig, VisualizationConfig, MetricFormat } from './dashboard-config';

// Column type detection
export type ColumnType = 'number' | 'currency' | 'percentage' | 'date' | 'category' | 'text';

export interface ColumnInfo {
    name: string;
    type: ColumnType;
    sampleValues: any[];
    isUnique: boolean;
    distinctCount: number;
}

/**
 * Analyze CSV data and detect column types
 */
export function analyzeCSVColumns(data: any[]): ColumnInfo[] {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    const columnNames = Object.keys(firstRow);

    return columnNames.map(name => {
        const values = data.map(row => row[name]).filter(v => v !== null && v !== undefined);
        const sampleValues = values.slice(0, 10);
        const distinctCount = new Set(values).size;

        return {
            name,
            type: detectColumnType(name, sampleValues),
            sampleValues,
            isUnique: distinctCount === values.length,
            distinctCount
        };
    });
}

/**
 * Detect column type based on name and sample values
 */
function detectColumnType(columnName: string, sampleValues: any[]): ColumnType {
    const nameLower = columnName.toLowerCase();

    // Specific Technical/DS Column Overrides
    if (nameLower.includes('decil') || nameLower.includes('segmento') || nameLower.includes('rango')) {
        return 'category';
    }
    if (nameLower === 'ks' || nameLower === 'roc' || nameLower === 'auc' || nameLower === 'psi' || nameLower === 'gini') {
        return 'number'; // Usually 0-1 or 0-100, but treated as a score
    }
    if (nameLower === 'lift') {
        return 'number';
    }

    // Check name patterns first
    if (nameLower.includes('fecha') || nameLower.includes('date') || nameLower.includes('time')) {
        return 'date';
    }

    if (nameLower.includes('tasa') || nameLower.includes('rate') || nameLower.includes('%') || nameLower.includes('percent') || nameLower.includes('probabilidad')) {
        return 'percentage';
    }

    if (nameLower.includes('saldo') || nameLower.includes('monto') || nameLower.includes('amount') ||
        nameLower.includes('$') || nameLower.includes('precio') || nameLower.includes('price') ||
        nameLower.includes('ingreso') || nameLower.includes('revenue') || nameLower.includes('pago') || nameLower.includes('payment')) {
        return 'currency';
    }

    // Analyze sample values
    const numericValues = sampleValues.filter(v => !isNaN(parseFloat(v)));
    const isAllNumeric = numericValues.length === sampleValues.length;

    if (isAllNumeric) {
        // Check if values look like percentages (0-100 or 0-1)
        const nums = numericValues.map(v => parseFloat(v));
        const allBetween0And100 = nums.every(n => n >= 0 && n <= 100);
        const allBetween0And1 = nums.every(n => n >= 0 && n <= 1);

        if (allBetween0And1 && !nameLower.includes('id')) {
            return 'percentage';
        }

        if (allBetween0And100 && (nameLower.includes('tasa') || nameLower.includes('rate'))) {
            return 'percentage';
        }

        // Check if values are large (might be currency)
        const avgValue = nums.reduce((sum, n) => sum + n, 0) / nums.length;
        if (avgValue > 10000) {
            return 'currency';
        }

        return 'number';
    }

    // Check if categorical (limited distinct values)
    const distinctCount = new Set(sampleValues).size;
    if (distinctCount < sampleValues.length * 0.5 && distinctCount < 20) {
        return 'category';
    }

    return 'text';
}

/**
 * Suggest KPI configurations based on detected columns
 */
export function suggestKPIs(columns: ColumnInfo[]): KPIConfig[] {
    const suggestions: KPIConfig[] = [];

    // Priority metrics for Technical/DS dashboards
    const priorityMetrics = ['ks', 'roc', 'auc', 'psi', 'lift', 'tasa_buenos', 'tasa_recuperacion', 'tasa_exito'];

    // Find numeric/currency/percentage columns for KPIs
    const metricColumns = columns.filter(c =>
        c.type === 'number' || c.type === 'currency' || c.type === 'percentage'
    );

    // Sort columns: Priority metrics first, then others
    metricColumns.sort((a, b) => {
        const aIndex = priorityMetrics.findIndex(p => a.name.toLowerCase().includes(p));
        const bIndex = priorityMetrics.findIndex(p => b.name.toLowerCase().includes(p));

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
    });

    metricColumns.slice(0, 4).forEach((col, index) => {
        const format: MetricFormat = col.type === 'currency' ? 'currency' :
            col.type === 'percentage' ? 'percentage' : 'number';

        // Special handling for aggregation
        let aggregation: 'sum' | 'avg' | 'min' | 'max' = 'avg';
        if (col.type === 'currency' || col.name.toLowerCase().includes('total') || col.name.toLowerCase().includes('clientes')) {
            aggregation = 'sum';
        }
        // KS, ROC, PSI should be max or avg, not sum
        if (['ks', 'roc', 'auc', 'psi'].some(k => col.name.toLowerCase().includes(k))) {
            aggregation = 'max'; // Usually want the best or latest score
        }

        suggestions.push({
            id: `kpi-${index + 1}`,
            title: formatColumnName(col.name),
            metricKey: col.name,
            format,
            aggregation,
            icon: getIconForMetric(col.name, col.type)
        });
    });

    return suggestions;
}

/**
 * Suggest visualizations based on detected columns
 */
export function suggestVisualizations(columns: ColumnInfo[]): VisualizationConfig[] {
    const suggestions: VisualizationConfig[] = [];

    const dateColumn = columns.find(c => c.type === 'date');
    const categoryColumns = columns.filter(c => c.type === 'category');
    const metricColumns = columns.filter(c =>
        c.type === 'number' || c.type === 'currency' || c.type === 'percentage'
    );

    // 1. Decile Analysis (Specific for Technical/Risk)
    const decilColumn = columns.find(c => c.name.toLowerCase().includes('decil'));
    const tasaBuenos = columns.find(c => c.name.toLowerCase().includes('tasa_buenos') || c.name.toLowerCase().includes('tasa_respuesta'));
    const distribucion = columns.find(c => c.name.toLowerCase().includes('distribucion'));
    const lift = columns.find(c => c.name.toLowerCase().includes('lift'));

    if (decilColumn && tasaBuenos) {
        suggestions.push({
            id: 'viz-deciles-performance',
            type: 'bar',
            title: 'Performance por Decil',
            description: 'Tasa de Buenos vs Decil de Probabilidad',
            dataSource: 'current',
            xAxis: decilColumn.name,
            yAxis: [tasaBuenos.name, ...(distribucion ? [distribucion.name] : [])]
        });
    }

    if (decilColumn && lift) {
        suggestions.push({
            id: 'viz-deciles-lift',
            type: 'line',
            title: 'Lift por Decil',
            description: 'Capacidad predictiva del modelo por decil',
            dataSource: 'current',
            xAxis: decilColumn.name,
            yAxis: [lift.name]
        });
    }

    // 2. Temporal line chart if we have date + metrics (Standard)
    if (dateColumn && metricColumns.length > 0) {
        // Prioritize important metrics for time series
        const timeSeriesMetrics = metricColumns
            .filter(c => !c.name.toLowerCase().includes('decil')) // Don't plot decil over time usually
            .slice(0, 3)
            .map(c => c.name);

        suggestions.push({
            id: 'viz-temporal',
            type: 'line',
            title: 'Evolución Temporal',
            description: 'Tendencia de indicadores clave',
            dataSource: 'history',
            xAxis: dateColumn.name,
            yAxis: timeSeriesMetrics
        });
    }

    // 3. Bar chart for other categories (e.g., Segmento)
    const otherCategory = categoryColumns.find(c => !c.name.toLowerCase().includes('decil'));
    if (otherCategory && metricColumns.length > 0) {
        const metricCol = metricColumns[0];
        suggestions.push({
            id: 'viz-category-bar',
            type: 'bar',
            title: `${formatColumnName(metricCol.name)} por ${formatColumnName(otherCategory.name)}`,
            description: `Distribución por ${formatColumnName(otherCategory.name)}`,
            dataSource: 'current',
            xAxis: otherCategory.name,
            yAxis: [metricCol.name]
        });
    }

    // 4. Table with all important columns
    const importantColumns = [
        ...(decilColumn ? [decilColumn] : []),
        ...categoryColumns.slice(0, 1),
        ...metricColumns.slice(0, 5)
    ];
    // Deduplicate
    const uniqueCols = Array.from(new Set(importantColumns));

    if (uniqueCols.length > 0) {
        suggestions.push({
            id: 'viz-table',
            type: 'table',
            title: 'Desglose Detallado',
            description: 'Vista completa de métricas',
            dataSource: 'current',
            xAxis: uniqueCols[0].name,
            yAxis: uniqueCols.slice(1).map(c => c.name)
        });
    }

    return suggestions;
}

/**
 * Generate a complete dashboard config from CSV data
 */
export function generateDashboardConfig(
    useCaseId: string,
    useCaseName: string,
    csvData: any[]
): DashboardConfig {
    const columns = analyzeCSVColumns(csvData);
    const kpis = suggestKPIs(columns);
    const visualizations = suggestVisualizations(columns);

    return {
        id: `dashboard-${useCaseId}-${Date.now()}`,
        useCaseId,
        name: `Dashboard de ${useCaseName}`,
        layout: 'tabs',
        kpis,
        visualizations,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Helper: Format column name to title case
 */
function formatColumnName(name: string): string {
    return name
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
}

/**
 * Helper: Get appropriate icon for metric type
 */
function getIconForMetric(name: string, type: ColumnType): string {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('cliente') || nameLower.includes('user')) return 'Users';
    if (nameLower.includes('saldo') || nameLower.includes('amount') || type === 'currency') return 'DollarSign';
    if (nameLower.includes('tasa') || nameLower.includes('rate') || type === 'percentage') return 'Percent';
    if (nameLower.includes('trend') || nameLower.includes('crecimiento') || nameLower.includes('lift')) return 'TrendingUp';
    if (nameLower.includes('total') || nameLower.includes('sum')) return 'Sigma';
    if (nameLower.includes('tiempo') || nameLower.includes('time')) return 'Clock';
    if (nameLower.includes('ks') || nameLower.includes('roc') || nameLower.includes('psi')) return 'Activity';

    return 'Activity';
}
