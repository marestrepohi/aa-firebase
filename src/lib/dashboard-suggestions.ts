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

    // Check name patterns first
    if (nameLower.includes('fecha') || nameLower.includes('date') || nameLower.includes('time')) {
        return 'date';
    }

    if (nameLower.includes('tasa') || nameLower.includes('rate') || nameLower.includes('%') || nameLower.includes('percent')) {
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

    // Find numeric/currency/percentage columns for KPIs
    const metricColumns = columns.filter(c =>
        c.type === 'number' || c.type === 'currency' || c.type === 'percentage'
    );

    metricColumns.slice(0, 4).forEach((col, index) => {
        const format: MetricFormat = col.type === 'currency' ? 'currency' :
            col.type === 'percentage' ? 'percentage' : 'number';

        suggestions.push({
            id: `kpi-${index + 1}`,
            title: formatColumnName(col.name),
            metricKey: col.name,
            format,
            aggregation: col.type === 'currency' ? 'sum' : 'avg',
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

    // Temporal line chart if we have date + metrics
    if (dateColumn && metricColumns.length > 0) {
        suggestions.push({
            id: 'viz-temporal',
            type: 'line',
            title: 'Evolución Temporal',
            description: 'Tendencia a lo largo del tiempo',
            dataSource: 'history',
            xAxis: dateColumn.name,
            yAxis: metricColumns.slice(0, 3).map(c => c.name)
        });
    }

    // Bar chart for category + metric
    if (categoryColumns.length > 0 && metricColumns.length > 0) {
        const categoryCol = categoryColumns[0];
        const metricCol = metricColumns[0];

        suggestions.push({
            id: 'viz-category-bar',
            type: 'bar',
            title: `${formatColumnName(metricCol.name)} por ${formatColumnName(categoryCol.name)}`,
            description: `Distribución por ${formatColumnName(categoryCol.name)}`,
            dataSource: 'current',
            xAxis: categoryCol.name,
            yAxis: [metricCol.name]
        });
    }

    // Table with all important columns
    const importantColumns = [
        ...categoryColumns.slice(0, 1),
        ...metricColumns.slice(0, 5)
    ];

    if (importantColumns.length > 0) {
        suggestions.push({
            id: 'viz-table',
            type: 'table',
            title: 'Desglose Detallado',
            description: 'Vista completa de métricas',
            dataSource: 'current',
            xAxis: importantColumns[0].name,
            yAxis: importantColumns.slice(1).map(c => c.name)
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
    if (nameLower.includes('trend') || nameLower.includes('crecimiento')) return 'TrendingUp';
    if (nameLower.includes('total') || nameLower.includes('sum')) return 'Sigma';
    if (nameLower.includes('tiempo') || nameLower.includes('time')) return 'Clock';

    return 'Activity';
}
