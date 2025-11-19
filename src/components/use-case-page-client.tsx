'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { CobranzasDashboard } from '@/components/cobranzas-dashboard';
import { DollarSign, Briefcase, Activity, Info } from 'lucide-react';
import type { Entity, UseCase, Kpi } from '@/lib/types';
import { format } from 'date-fns';
import { MetricsHistorySelector } from '@/components/metrics-history-selector';
import { getMetricsHistory, getMetric } from '@/lib/data';

function isValidDate(dateString: string | undefined): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function InfoBox({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) {
    const content = children || <span className="text-muted-foreground italic">No definido</span>;
    return (
        <div className={`border border-gray-200 rounded-lg p-4 relative ${className}`}>
            <h2 className="absolute -top-2.5 left-3 bg-background px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
            <div className="text-sm text-gray-800 pt-2">{content}</div>
        </div>
    );
}

const KpiMetricsDisplay = ({ title, kpis }: { title: string, kpis?: Kpi[] }) => {
    const getLatestValorGenerado = (kpi: Kpi) => {
        if (!kpi.valoresGenerados || kpi.valoresGenerados.length === 0) {
            return null;
        }
        const sorted = [...kpi.valoresGenerados]
            .filter(v => v.date && isValidDate(v.date))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return sorted.length > 0 ? sorted[0] : null;
    };

    return (
        <InfoBox title={title} className="col-span-full">
            {kpis && kpis.length > 0 ? (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2 text-left font-medium text-muted-foreground">KPI</th>
                            <th className="pb-2 text-left font-medium text-muted-foreground">Descripción</th>
                            <th className="pb-2 text-left font-medium text-muted-foreground">Valor Esperado</th>
                            <th className="pb-2 text-left font-medium text-muted-foreground">Último Valor Generado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.map((kpi, index) => {
                            const latestValor = getLatestValorGenerado(kpi);
                            return (
                                <tr key={index} className="border-b last:border-0">
                                    <td className="py-2.5 pr-4 font-medium">{kpi.nombre}</td>
                                    <td className="py-2.5 pr-4 text-muted-foreground">{kpi.descripcion}</td>
                                    <td className="py-2.5 pr-4">{kpi.valorEsperado}</td>
                                    <td className="py-2.5 pr-4">
                                        {latestValor ? (
                                            <span>
                                                {latestValor.value}{' '}
                                                {isValidDate(latestValor.date) ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({format(new Date(`${latestValor.date}T00:00:00`), 'dd/MM/yyyy')})
                                                    </span>
                                                ) : null}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted-foreground italic">No hay KPIs definidos.</p>
            )}
        </InfoBox>
    );
}

const MetricTabContent = ({ entityId, useCaseId, category, descriptions, initialMetrics, isCobranzas }: {
    entityId: string,
    useCaseId: string,
    category: string,
    descriptions: Record<string, string>,
    initialMetrics?: any,
    isCobranzas?: boolean
}) => {
    const [history, setHistory] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [metricsData, setMetricsData] = useState<any>(initialMetrics || {});
    const [loading, setLoading] = useState(false);

    // Fetch history on mount
    useEffect(() => {
        async function loadHistory() {
            const h = await getMetricsHistory(entityId, useCaseId, category);
            setHistory(h);
            if (h.length > 0) {
                setSelectedId(h[0].id);
            }
        }
        loadHistory();
    }, [entityId, useCaseId, category]);

    // Fetch metric data when selectedId changes
    useEffect(() => {
        if (!selectedId) return;

        async function loadMetric() {
            setLoading(true);
            try {
                const data = await getMetric(entityId, useCaseId, category, selectedId);
                // If data has a 'data' field (CSV rows), use that. Otherwise use the whole object.
                // For MetricsCard, we expect a simple object.
                // For Cobranzas, we pass the raw array.

                if (isCobranzas) {
                    setMetricsData(data.data || []);
                } else {
                    // For standard metrics, if it's CSV data, we might want to show the first row?
                    // Or if it's a summary object.
                    // If 'data' field exists and is array, take first row.
                    // If not, use the object itself (excluding system fields).
                    if (Array.isArray(data.data) && data.data.length > 0) {
                        setMetricsData(data.data[0]);
                    } else {
                        const { id, uploadedAt, period, ...rest } = data;
                        setMetricsData(rest);
                    }
                }
            } catch (e) {
                console.error("Error loading metric:", e);
            } finally {
                setLoading(false);
            }
        }
        loadMetric();
    }, [entityId, useCaseId, category, selectedId, isCobranzas]);

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <MetricsHistorySelector
                    entityId={entityId}
                    useCaseId={useCaseId}
                    category={category}
                    selectedHistoryId={selectedId}
                    onHistoryChange={setSelectedId}
                />
            </div>

            {loading ? (
                <div className="py-12 text-center text-muted-foreground">Cargando métricas...</div>
            ) : (
                isCobranzas ? (
                    <CobranzasDashboard
                        metricsData={Array.isArray(metricsData) ? metricsData : []}
                        history={history}
                        descriptions={descriptions}
                        selectedHistoryId={selectedId}
                        onHistoryChange={setSelectedId}
                    />
                ) : (
                    <MetricsCard
                        title={`Métricas ${category === 'financial' ? 'Financieras' : category === 'business' ? 'de Negocio' : 'Técnicas'}`}
                        metrics={metricsData}
                        descriptions={descriptions}
                        icon={category === 'financial' ? <DollarSign className="h-5 w-5 text-muted-foreground" /> : category === 'business' ? <Briefcase className="h-5 w-5 text-muted-foreground" /> : <Activity className="h-5 w-5 text-muted-foreground" />}
                    />
                )
            )}
        </div>
    );
};

export function UseCasePageClient({ entity, useCase }: { entity: Entity; useCase: UseCase }) {
    const team = [useCase.ds1, useCase.ds2, useCase.ds3, useCase.ds4, useCase.de, useCase.mds].filter(Boolean).join(' - ');

    const descriptions = useMemo(() => {
        const allDescriptions: Record<string, string> = {};
        if (useCase.metricsConfig) {
            Object.values(useCase.metricsConfig).forEach(config => {
                Object.assign(allDescriptions, config.descriptions);
            });
        }
        return allDescriptions;
    }, [useCase.metricsConfig]);

    const isCobranzasUseCase = useCase.id === 'cobranzas-cartera-castigada-bdb';

    // Initial metrics from useCase prop (latest)
    // We can pass these to MetricTabContent as initial state, but we need to know if they match the latest history ID.
    // Since we fetch history inside MetricTabContent, we might just let it fetch data to be safe and consistent.
    // Or we can use useCase.metrics as a fallback if no history selected yet?
    // Let's just let MetricTabContent handle fetching. It's cleaner.

    return (
        <>
            <Tabs defaultValue="information">
                <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="information">Información General</TabsTrigger>
                    <TabsTrigger value="technical">Seguimiento Técnico</TabsTrigger>
                    <TabsTrigger value="business">Métricas de Negocio</TabsTrigger>
                    <TabsTrigger value="financial">Métricas Financieras</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="information">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Info /> Información del Proyecto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <InfoBox title="Estado">{useCase.status}</InfoBox>
                                    <InfoBox title="Fecha actualización">
                                        {useCase.lastUpdated && isValidDate(useCase.lastUpdated) ? format(new Date(useCase.lastUpdated), 'dd/MM/yyyy') : "N/A"}
                                    </InfoBox>
                                    <InfoBox title="Sponsor" className="col-span-2">{useCase.sponsor}</InfoBox>
                                </div>
                                <InfoBox title="Equipo Técnico">{team}</InfoBox>
                                <div className="grid grid-cols-2 gap-6">
                                    <InfoBox title="Objetivo" className="min-h-[120px]">{useCase.objetivo}</InfoBox>
                                    <InfoBox title="Dolores" className="min-h-[120px]">{useCase.dolores}</InfoBox>
                                    <InfoBox title="Solución" className="min-h-[120px]">{useCase.solucion}</InfoBox>
                                    <InfoBox title="Riesgos" className="min-h-[120px]">{useCase.riesgos}</InfoBox>
                                </div>
                                <KpiMetricsDisplay title="Impacto (KPIs)" kpis={useCase.kpis} />
                                <InfoBox title="Observaciones">{useCase.observaciones}</InfoBox>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="technical">
                        <MetricTabContent
                            entityId={entity.id}
                            useCaseId={useCase.id}
                            category="technical"
                            descriptions={descriptions}
                            isCobranzas={isCobranzasUseCase}
                        />
                    </TabsContent>
                    <TabsContent value="business">
                        <MetricTabContent
                            entityId={entity.id}
                            useCaseId={useCase.id}
                            category="business"
                            descriptions={descriptions}
                        />
                    </TabsContent>
                    <TabsContent value="financial">
                        <MetricTabContent
                            entityId={entity.id}
                            useCaseId={useCase.id}
                            category="financial"
                            descriptions={descriptions}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </>
    );
}
