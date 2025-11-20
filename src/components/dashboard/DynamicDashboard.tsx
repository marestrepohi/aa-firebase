"use client";

import { DynamicKPI } from './DynamicKPI';
import { DynamicChart } from './DynamicChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DashboardConfig } from '@/lib/dashboard-config';

interface DynamicDashboardProps {
    config: DashboardConfig;
    metricsData: any[]; // Current metrics data
    history?: any[]; // Historical metrics data
    selectedHistoryId?: string;
    onHistoryChange?: (id: string) => void;
}

export function DynamicDashboard({
    config,
    metricsData,
    history = [],
    selectedHistoryId,
    onHistoryChange
}: DynamicDashboardProps) {

    // Get data based on data source
    const getDataForSource = (source: string) => {
        switch (source) {
            case 'history':
                return history;
            case 'current':
            default:
                return metricsData;
        }
    };

    // Render based on layout type
    const renderContent = () => {
        if (config.layout === 'tabs') {
            // Group visualizations by tabs (you could have a tabId in VisualizationConfig)
            return (
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-auto">
                        <TabsTrigger value="overview">Resumen</TabsTrigger>
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                        <TabsTrigger value="trends">Tendencias</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            {config.visualizations
                                .filter(v => !v.id.includes('trend')) // Simple heuristic
                                .slice(0, 4)
                                .map(vizConfig => (
                                    <DynamicChart
                                        key={vizConfig.id}
                                        config={vizConfig}
                                        data={getDataForSource(vizConfig.dataSource)}
                                    />
                                ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6 mt-6">
                        {config.visualizations
                            .filter(v => v.type === 'table')
                            .map(vizConfig => (
                                <DynamicChart
                                    key={vizConfig.id}
                                    config={vizConfig}
                                    data={getDataForSource(vizConfig.dataSource)}
                                />
                            ))}
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            {config.visualizations
                                .filter(v => v.dataSource === 'history')
                                .map(vizConfig => (
                                    <DynamicChart
                                        key={vizConfig.id}
                                        config={vizConfig}
                                        data={getDataForSource(vizConfig.dataSource)}
                                        className="col-span-full"
                                    />
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>
            );
        }

        // Grid layout (default)
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {config.visualizations.map(vizConfig => (
                        <DynamicChart
                            key={vizConfig.id}
                            config={vizConfig}
                            data={getDataForSource(vizConfig.dataSource)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold">{config.name}</h2>
                <p className="text-sm text-muted-foreground">Dashboard Dinámico</p>
            </div>

            {/* KPIs */}
            {config.kpis.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {config.kpis.map(kpiConfig => (
                        <DynamicKPI
                            key={kpiConfig.id}
                            config={kpiConfig}
                            data={metricsData}
                        />
                    ))}
                </div>
            )}

            {/* Visualizations */}
            {renderContent()}
        </div>
    );
}
