'use client';

import { KPIConfig, MetricFormat, Aggregation } from '@/lib/dashboard-config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Activity, DollarSign, Percent, Users, TrendingUp, Clock, Sigma } from 'lucide-react';

interface KPIBuilderProps {
    kpi: KPIConfig;
    onChange: (updates: Partial<KPIConfig>) => void;
    onRemove: () => void;
    availableColumns: string[];
}

const ICONS = [
    { value: 'Activity', label: 'Actividad', icon: Activity },
    { value: 'DollarSign', label: 'Dinero', icon: DollarSign },
    { value: 'Percent', label: 'Porcentaje', icon: Percent },
    { value: 'Users', label: 'Usuarios', icon: Users },
    { value: 'TrendingUp', label: 'Tendencia', icon: TrendingUp },
    { value: 'Clock', label: 'Tiempo', icon: Clock },
    { value: 'Sigma', label: 'Suma', icon: Sigma },
];

export function KPIBuilder({ kpi, onChange, onRemove, availableColumns }: KPIBuilderProps) {
    return (
        <Card className="relative group">
            <CardContent className="p-4 grid gap-4">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label>Título</Label>
                        <Input
                            value={kpi.title}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="Ej: Total Ventas"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Columna de Datos</Label>
                        <Select value={kpi.metricKey} onValueChange={(val) => onChange({ metricKey: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar columna" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableColumns.map(col => (
                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Formato</Label>
                        <Select value={kpi.format} onValueChange={(val) => onChange({ format: val as MetricFormat })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="number">Numérico</SelectItem>
                                <SelectItem value="currency">Moneda ($)</SelectItem>
                                <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Agregación</Label>
                        <Select value={kpi.aggregation} onValueChange={(val) => onChange({ aggregation: val as Aggregation })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sum">Suma Total</SelectItem>
                                <SelectItem value="avg">Promedio</SelectItem>
                                <SelectItem value="min">Mínimo</SelectItem>
                                <SelectItem value="max">Máximo</SelectItem>
                                <SelectItem value="count">Conteo</SelectItem>
                                <SelectItem value="last">Último Valor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Icono</Label>
                        <Select value={kpi.icon} onValueChange={(val) => onChange({ icon: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ICONS.map(icon => (
                                    <SelectItem key={icon.value} value={icon.value}>
                                        <div className="flex items-center gap-2">
                                            <icon.icon className="h-4 w-4" />
                                            <span>{icon.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
