"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ResponsiveContainer,
    LineChart,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Line,
    Bar
} from 'recharts';
import type { VisualizationConfig } from '@/lib/dashboard-config';
import { getValueByKey } from '@/lib/dashboard-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DynamicChartProps {
    config: VisualizationConfig;
    data: any[];
    className?: string;
}

export function DynamicChart({ config, data, className = "" }: DynamicChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Transform data for charting
        return data.map(row => {
            const transformed: any = {};

            // Add X axis value
            if (config.xAxis) {
                transformed[config.xAxis] = getValueByKey(row, config.xAxis);
            }

            // Add Y axis values
            config.yAxis?.forEach(yKey => {
                const value = getValueByKey(row, yKey);
                transformed[yKey] = typeof value === 'string' ? parseFloat(value) : value;
            });

            return transformed;
        });
    }, [data, config]);

    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No hay datos disponibles
                </div>
            );
        }

        switch (config.type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={config.xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {config.yAxis?.map((yKey, index) => (
                                <Bar
                                    key={yKey}
                                    dataKey={yKey}
                                    fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                                    name={yKey}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={config.xAxis} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {config.yAxis?.map((yKey, index) => (
                                <Line
                                    key={yKey}
                                    type="monotone"
                                    dataKey={yKey}
                                    stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                                    strokeWidth={2}
                                    name={yKey}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'table':
                const columns = [config.xAxis, ...(config.yAxis || [])].filter(Boolean);
                return (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map(col => (
                                        <TableHead key={col} className="text-right">
                                            {col}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartData.map((row, i) => (
                                    <TableRow key={i}>
                                        {columns.map(col => (
                                            <TableCell key={col} className="text-right">
                                                {row[col] !== undefined ? String(row[col]) : '-'}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Tipo de visualización no soportado: {config.type}
                    </div>
                );
        }
    };

    return (
        <Card className={`card-standard ${className}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-base md:text-lg font-semibold">
                    {config.title}
                </CardTitle>
                {config.description && (
                    <CardDescription className="text-xs md:text-sm">
                        {config.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {renderChart()}
            </CardContent>
        </Card>
    );
}
