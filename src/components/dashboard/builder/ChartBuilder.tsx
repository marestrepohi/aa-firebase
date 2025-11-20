'use client';

import { VisualizationConfig, VisualizationType } from '@/lib/dashboard-config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, BarChart3, LineChart, Table } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ChartBuilderProps {
    chart: VisualizationConfig;
    onChange: (updates: Partial<VisualizationConfig>) => void;
    onRemove: () => void;
    availableColumns: string[];
}

export function ChartBuilder({ chart, onChange, onRemove, availableColumns }: ChartBuilderProps) {

    const handleYAxisChange = (col: string, checked: boolean) => {
        let newYAxis = [...chart.yAxis];
        if (checked) {
            if (!newYAxis.includes(col)) newYAxis.push(col);
        } else {
            newYAxis = newYAxis.filter(c => c !== col);
        }
        onChange({ yAxis: newYAxis });
    };

    return (
        <Card className="relative group">
            <CardContent className="p-4 grid gap-4">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5 col-span-2">
                        <Label>Título del Gráfico</Label>
                        <Input
                            value={chart.title}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="Ej: Evolución de Ventas"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Tipo de Visualización</Label>
                        <Select value={chart.type} onValueChange={(val) => onChange({ type: val as VisualizationType })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">
                                    <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Barras</div>
                                </SelectItem>
                                <SelectItem value="line">
                                    <div className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Líneas</div>
                                </SelectItem>
                                <SelectItem value="table">
                                    <div className="flex items-center gap-2"><Table className="h-4 w-4" /> Tabla</div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Fuente de Datos</Label>
                        <Select value={chart.dataSource} onValueChange={(val) => onChange({ dataSource: val as 'current' | 'history' })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="current">Datos Actuales (CSV)</SelectItem>
                                <SelectItem value="history">Histórico (Tendencias)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Eje X (Categoría/Fecha)</Label>
                        <Select value={chart.xAxis} onValueChange={(val) => onChange({ xAxis: val })}>
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

                    <div className="grid gap-1.5 col-span-2">
                        <Label className="mb-2 block">Eje Y (Métricas a graficar)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-md p-3 max-h-32 overflow-y-auto">
                            {availableColumns.map(col => (
                                <div key={col} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`y-${chart.id}-${col}`}
                                        checked={chart.yAxis.includes(col)}
                                        onCheckedChange={(checked) => handleYAxisChange(col, checked as boolean)}
                                    />
                                    <label
                                        htmlFor={`y-${chart.id}-${col}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                                        title={col}
                                    >
                                        {col}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
