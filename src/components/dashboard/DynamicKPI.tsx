"use client";

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import type { KPIConfig } from '@/lib/dashboard-config';
import { formatValue, getValueByKey, aggregateValues } from '@/lib/dashboard-config';

interface DynamicKPIProps {
    config: KPIConfig;
    data: any[]; // Raw metrics data
}

export function DynamicKPI({ config, data }: DynamicKPIProps) {
    const value = useMemo(() => {
        if (!data || data.length === 0) return '0';

        // Extract values using the metric key
        const values = data
            .map(row => getValueByKey(row, config.metricKey))
            .filter(v => v !== undefined && v !== null)
            .map(v => typeof v === 'string' ? parseFloat(v) : v)
            .filter(v => !isNaN(v));

        if (values.length === 0) return '0';

        // Apply aggregation if specified
        const aggregated = config.aggregation
            ? aggregateValues(values, config.aggregation)
            : values[0];

        return formatValue(aggregated, config.format);
    }, [data, config]);

    // Get icon dynamically
    const IconComponent = config.icon && Icons[config.icon as keyof typeof Icons]
        ? Icons[config.icon as keyof typeof Icons]
        : Icons.Activity;

    return (
        <Card className="card-standard">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${config.color || 'bg-primary/10'}`}>
                        <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <div>
                    <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                        {value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                        {config.title}
                    </p>
                    {config.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {config.description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
