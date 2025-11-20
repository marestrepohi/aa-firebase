'use client';

import { useState, useEffect } from 'react';
import { DashboardConfig, KPIConfig, VisualizationConfig } from '@/lib/dashboard-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Save, Trash2, MoveUp, MoveDown, LayoutDashboard, BarChart3 } from 'lucide-react';
import { KPIBuilder } from './KPIBuilder';
import { ChartBuilder } from './ChartBuilder';
import { saveDashboardConfig } from '@/lib/dashboard-api';
import { useToast } from '@/hooks/use-toast';

interface DashboardBuilderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialConfig: DashboardConfig | null;
    entityId: string;
    useCaseId: string;
    category: string;
    onSave: (config: DashboardConfig) => void;
    availableColumns: string[]; // Derived from metrics data
}

export function DashboardBuilder({
    open,
    onOpenChange,
    initialConfig,
    entityId,
    useCaseId,
    category,
    onSave,
    availableColumns
}: DashboardBuilderProps) {
    const { toast } = useToast();
    const [config, setConfig] = useState<DashboardConfig>(() => {
        if (initialConfig) return initialConfig;
        return {
            id: `dashboard-${Date.now()}`,
            useCaseId,
            name: 'Nuevo Dashboard',
            layout: 'tabs',
            kpis: [],
            visualizations: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    });

    const [activeTab, setActiveTab] = useState('kpis');

    // Reset config when initialConfig changes
    useEffect(() => {
        if (initialConfig) {
            setConfig(initialConfig);
        }
    }, [initialConfig]);

    const handleSave = async () => {
        try {
            const updatedConfig = {
                ...config,
                updatedAt: new Date().toISOString()
            };

            await saveDashboardConfig(entityId, useCaseId, category, updatedConfig);
            onSave(updatedConfig);
            onOpenChange(false);

            toast({
                title: "Dashboard guardado",
                description: "La configuración se ha actualizado correctamente.",
            });
        } catch (error) {
            console.error('Error saving dashboard:', error);
            toast({
                title: "Error",
                description: "No se pudo guardar la configuración.",
                variant: "destructive"
            });
        }
    };

    const addKPI = () => {
        const newKPI: KPIConfig = {
            id: `kpi-${Date.now()}`,
            title: 'Nuevo KPI',
            metricKey: availableColumns[0] || '',
            format: 'number',
            aggregation: 'sum',
            icon: 'Activity'
        };
        setConfig(prev => ({ ...prev, kpis: [...prev.kpis, newKPI] }));
    };

    const updateKPI = (index: number, updates: Partial<KPIConfig>) => {
        const newKPIs = [...config.kpis];
        newKPIs[index] = { ...newKPIs[index], ...updates };
        setConfig(prev => ({ ...prev, kpis: newKPIs }));
    };

    const removeKPI = (index: number) => {
        const newKPIs = [...config.kpis];
        newKPIs.splice(index, 1);
        setConfig(prev => ({ ...prev, kpis: newKPIs }));
    };

    const addChart = () => {
        const newChart: VisualizationConfig = {
            id: `viz-${Date.now()}`,
            type: 'bar',
            title: 'Nuevo Gráfico',
            description: '',
            dataSource: 'current',
            xAxis: availableColumns[0] || '',
            yAxis: [availableColumns[1] || availableColumns[0] || '']
        };
        setConfig(prev => ({ ...prev, visualizations: [...prev.visualizations, newChart] }));
    };

    const updateChart = (index: number, updates: Partial<VisualizationConfig>) => {
        const newViz = [...config.visualizations];
        newViz[index] = { ...newViz[index], ...updates };
        setConfig(prev => ({ ...prev, visualizations: newViz }));
    };

    const removeChart = (index: number) => {
        const newViz = [...config.visualizations];
        newViz.splice(index, 1);
        setConfig(prev => ({ ...prev, visualizations: newViz }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editar Dashboard ({category})</DialogTitle>
                    <DialogDescription>
                        Personaliza los KPIs y gráficos que se muestran en este dashboard.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
                    <div className="flex items-center gap-4">
                        <div className="grid gap-1.5 flex-1">
                            <Label htmlFor="dash-name">Nombre del Dashboard</Label>
                            <Input
                                id="dash-name"
                                value={config.name}
                                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="kpis" className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" /> KPIs ({config.kpis.length})
                            </TabsTrigger>
                            <TabsTrigger value="charts" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" /> Gráficos ({config.visualizations.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="kpis" className="flex-1 overflow-hidden flex flex-col mt-4">
                            <div className="flex justify-end mb-2">
                                <Button onClick={addKPI} size="sm" className="gap-1">
                                    <Plus className="h-4 w-4" /> Agregar KPI
                                </Button>
                            </div>
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4">
                                    {config.kpis.map((kpi, index) => (
                                        <KPIBuilder
                                            key={kpi.id}
                                            kpi={kpi}
                                            onChange={(updates) => updateKPI(index, updates)}
                                            onRemove={() => removeKPI(index)}
                                            availableColumns={availableColumns}
                                        />
                                    ))}
                                    {config.kpis.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                            No hay KPIs configurados. Agrega uno para comenzar.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="charts" className="flex-1 overflow-hidden flex flex-col mt-4">
                            <div className="flex justify-end mb-2">
                                <Button onClick={addChart} size="sm" className="gap-1">
                                    <Plus className="h-4 w-4" /> Agregar Gráfico
                                </Button>
                            </div>
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4">
                                    {config.visualizations.map((viz, index) => (
                                        <ChartBuilder
                                            key={viz.id}
                                            chart={viz}
                                            onChange={(updates) => updateChart(index, updates)}
                                            onRemove={() => removeChart(index)}
                                            availableColumns={availableColumns}
                                        />
                                    ))}
                                    {config.visualizations.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                            No hay gráficos configurados. Agrega uno para comenzar.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" /> Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
