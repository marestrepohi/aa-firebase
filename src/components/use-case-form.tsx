'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateUseCase } from '@/lib/data';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseCaseHistory } from './use-case-history';
import type { UseCase, Kpi, ValorGenerado } from '@/lib/types';

const KpiMetricsTable = ({ title, kpis, onKpiChange, onAddKpi, onRemoveKpi, onAddValorGenerado, onRemoveValorGenerado, onValorGeneradoChange }: {
    title: string,
    kpis: Kpi[],
    onKpiChange: (kpiIndex: number, field: keyof Kpi, value: string) => void,
    onAddKpi: () => void,
    onRemoveKpi: (kpiIndex: number) => void,
    onAddValorGenerado: (kpiIndex: number) => void,
    onRemoveValorGenerado: (kpiIndex: number, valorIndex: number) => void,
    onValorGeneradoChange: (kpiIndex: number, valorIndex: number, field: keyof ValorGenerado, value: string) => void,
}) => {
    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold">{title}</h3>
                <Button type="button" size="sm" variant="outline" onClick={onAddKpi}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar KPI
                </Button>
            </div>
            {kpis.length > 0 && (
                <div className="space-y-3 -mx-2">
                    {kpis.map((kpi, kpiIndex) => (
                        <div key={kpi.id} className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 p-2 border-b last:border-0">
                            <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveKpi(kpiIndex)} className="row-span-3 h-8 w-8 self-center">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>

                            <Input 
                                placeholder="Nombre del KPI" 
                                value={kpi.nombre} 
                                onChange={e => onKpiChange(kpiIndex, 'nombre', e.target.value)}
                                className="font-semibold"
                            />
                             <Textarea
                                placeholder="Descripción del KPI"
                                value={kpi.descripcion}
                                onChange={e => onKpiChange(kpiIndex, 'descripcion', e.target.value)}
                                className="col-span-full ml-11"
                                rows={2}
                            />
                            
                            <div className="col-span-full ml-11 grid grid-cols-2 gap-2">
                                <Select value={kpi.tipoValor} onValueChange={(v) => onKpiChange(kpiIndex, 'tipoValor', v)}>
                                    <SelectTrigger><SelectValue placeholder="Tipo de Valor" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="moneda">Moneda ($)</SelectItem>
                                        <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                                        <SelectItem value="número">Número</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    placeholder="Valor Esperado" 
                                    value={kpi.valorEsperado} 
                                    onChange={e => onKpiChange(kpiIndex, 'valorEsperado', e.target.value)} 
                                />
                            </div>

                            <div className="col-span-full ml-11 space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold">Historial de Valor Generado</Label>
                                    <Button type="button" size="xs" variant="outline" onClick={() => onAddValorGenerado(kpiIndex)}>
                                        <Plus className="mr-1 h-3 w-3" /> Añadir
                                    </Button>
                                </div>
                                {kpi.valoresGenerados && kpi.valoresGenerados.length > 0 ? (
                                    kpi.valoresGenerados.map((valor, valorIndex) => (
                                        <div key={valorIndex} className="flex gap-2 items-center">
                                            <Input
                                                type="date"
                                                value={valor.date}
                                                onChange={e => onValorGeneradoChange(kpiIndex, valorIndex, 'date', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Valor"
                                                value={valor.value}
                                                onChange={e => onValorGeneradoChange(kpiIndex, valorIndex, 'value', e.target.value)}
                                            />
                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onRemoveValorGenerado(kpiIndex, valorIndex)}>
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-center text-muted-foreground py-2">No hay valores generados registrados.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {kpis.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">
                    No hay KPIs. Haz clic en "Agregar KPI" para crear uno.
                </p>
            )}
        </div>
    );
};

export function UseCaseForm({
  useCase,
  entityId,
  open,
  onOpenChange,
  onSuccess,
  initialHistory
}: UseCaseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultRoadmap = [
    { name: 'Definición y Desarrollo', completed: false },
    { name: 'Piloto', completed: false },
    { name: 'Automatización y Operativización', completed: false },
    { name: 'Seguimiento y Recalibración', completed: false },
  ];

  const [formData, setFormData] = useState({
    id: useCase?.id || '',
    name: useCase?.name || '',
    status: useCase?.status || 'En Estimación',
    highLevelStatus: useCase?.highLevelStatus || 'Activo',
    tipoProyecto: useCase?.tipoProyecto || '',
    tipoDesarrollo: useCase?.tipoDesarrollo || '',
    sponsor: useCase?.sponsor || '',
    ds1: useCase?.ds1 || '',
    ds2: useCase?.ds2 || '',
    ds3: useCase?.ds3 || '',
    ds4: useCase?.ds4 || '',
    de: useCase?.de || '',
    mds: useCase?.mds || '',
    observaciones: useCase?.observaciones || '',
    objetivo: useCase?.objetivo || '',
    solucion: useCase?.solucion || '',
    dolores: useCase?.dolores || '',
    riesgos: useCase?.riesgos || '',
    kpis: useCase?.kpis || [],
    roadmap: useCase?.roadmap && useCase.roadmap.length > 0 ? useCase.roadmap : defaultRoadmap,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleRoadmapChange = (index: number, checked: boolean) => {
    const newRoadmap = [...formData.roadmap];
    newRoadmap[index].completed = checked;
    setFormData({ ...formData, roadmap: newRoadmap });
  };

  const handleKpiChange = (
    kpiIndex: number,
    field: keyof Kpi,
    value: string
  ) => {
    const newKpis = [...formData.kpis];
    (newKpis[kpiIndex] as any)[field] = value;
    setFormData({ ...formData, kpis: newKpis });
  };
  
  const handleAddKpi = () => {
    const newKpi: Kpi = { 
      id: new Date().toISOString(), 
      nombre: '', 
      descripcion: '', 
      tipoValor: 'moneda', 
      valorEsperado: '', 
      valoresGenerados: [],
    };
    setFormData({ ...formData, kpis: [...formData.kpis, newKpi] });
  };
  
  const handleRemoveKpi = (kpiIndex: number) => {
    const newKpis = formData.kpis.filter((_, i) => i !== kpiIndex);
    setFormData({ ...formData, kpis: newKpis });
  };
  
  const handleAddValorGenerado = (kpiIndex: number) => {
    const newKpis = [...formData.kpis];
    const kpi = newKpis[kpiIndex];
    if (!kpi.valoresGenerados) {
      kpi.valoresGenerados = [];
    }
    const today = new Date().toISOString().split('T')[0];
    kpi.valoresGenerados.push({ date: today, value: '' });
    setFormData({ ...formData, kpis: newKpis });
  };

  const handleRemoveValorGenerado = (kpiIndex: number, valorIndex: number) => {
    const newKpis = [...formData.kpis];
    newKpis[kpiIndex].valoresGenerados = newKpis[kpiIndex].valoresGenerados?.filter((_, i) => i !== valorIndex);
    setFormData({ ...formData, kpis: newKpis });
  };

  const handleValorGeneradoChange = (kpiIndex: number, valorIndex: number, field: keyof ValorGenerado, value: string) => {
    const newKpis = [...formData.kpis];
    if (newKpis[kpiIndex]?.valoresGenerados?.[valorIndex]) {
        (newKpis[kpiIndex].valoresGenerados![valorIndex] as any)[field] = value;
        setFormData({ ...formData, kpis: newKpis });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToUpdate = {
        ...formData,
        entityId,
      };

      const success = await updateUseCase(dataToUpdate);

      if (success) {
        toast({
          title: 'Éxito',
          description: useCase
            ? 'Caso de uso actualizado correctamente'
            : 'Caso de uso creado correctamente',
        });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar el caso de uso',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving use case:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{useCase ? 'Editar Información General' : 'Nuevo Caso de Uso'}</DialogTitle>
          <DialogDescription>
            {useCase
              ? 'Actualiza la información general del caso de uso'
              : 'Crea un nuevo caso de uso en el sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <Tabs defaultValue="general" className="flex-grow flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="impact">Impacto (KPIs)</TabsTrigger>
              <TabsTrigger value="team">Equipo & Roadmap</TabsTrigger>
              {useCase && <TabsTrigger value="versions">Versiones</TabsTrigger>}
            </TabsList>

            <div className="flex-grow mt-4 overflow-y-auto pr-6">
                <TabsContent value="general" className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="id">ID *</Label>
                        <Input id="id" value={formData.id} onChange={handleInputChange} placeholder="ej: proyecto-churn" required disabled={!!useCase} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="ej: Modelo de Churn" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sponsor">Sponsor del Proyecto</Label>
                        <Input id="sponsor" value={formData.sponsor} onChange={handleInputChange} placeholder="Nombres de sponsors..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                            <SelectTrigger id="status"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="En Estimación">En Estimación</SelectItem>
                                <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                                <SelectItem value="En Desarrollo">En Desarrollo</SelectItem>
                                <SelectItem value="En Producción">En Producción</SelectItem>
                                <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                                <SelectItem value="Pausado">Pausado</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="highLevelStatus">Estado Alto Nivel</Label>
                        <Select value={formData.highLevelStatus} onValueChange={(v) => handleSelectChange('highLevelStatus', v)}>
                            <SelectTrigger id="highLevelStatus"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Activo">Activo</SelectItem>
                                <SelectItem value="Inactivo">Inactivo</SelectItem>
                                <SelectItem value="Estrategico">Estratégico</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones Generales</Label>
                        <Textarea id="observaciones" value={formData.observaciones} onChange={handleInputChange} placeholder="Observaciones adicionales..." rows={5} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="objetivo">Objetivo</Label>
                      <Textarea id="objetivo" value={formData.objetivo} onChange={handleInputChange} placeholder="Objetivo del proyecto..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="solucion">Solución</Label>
                      <Textarea id="solucion" value={formData.solucion} onChange={handleInputChange} placeholder="Solución propuesta..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dolores">Dolores</Label>
                      <Textarea id="dolores" value={formData.dolores} onChange={handleInputChange} placeholder="Problemas o dolores que resuelve..." rows={3} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="riesgos">Riesgos</Label>
                        <Textarea id="riesgos" value={formData.riesgos} onChange={handleInputChange} placeholder="Riesgos identificados..." rows={3} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="impact" className="space-y-6">
                   <KpiMetricsTable
                        title="KPIs de Impacto"
                        kpis={formData.kpis}
                        onKpiChange={handleKpiChange}
                        onAddKpi={handleAddKpi}
                        onRemoveKpi={handleRemoveKpi}
                        onAddValorGenerado={handleAddValorGenerado}
                        onRemoveValorGenerado={handleRemoveValorGenerado}
                        onValorGeneradoChange={handleValorGeneradoChange}
                    />
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Equipo Técnico</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input id="ds1" value={formData.ds1} onChange={handleInputChange} placeholder="DS1" />
                        <Input id="ds2" value={formData.ds2} onChange={handleInputChange} placeholder="DS2" />
                        <Input id="ds3" value={formData.ds3} onChange={handleInputChange} placeholder="DS3" />
                        <Input id="ds4" value={formData.ds4} onChange={handleInputChange} placeholder="DS4" />
                        <Input id="de" value={formData.de} onChange={handleInputChange} placeholder="DE" />
                        <Input id="mds" value={formData.mds} onChange={handleInputChange} placeholder="MDS" />
                      </div>
                    </div>
                    <div>
                        <Label>Roadmap</Label>
                        <div className="space-y-2 mt-2">
                            {formData.roadmap.map((phase: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`roadmap-${index}`}
                                        checked={phase.completed}
                                        onCheckedChange={(checked) => handleRoadmapChange(index, !!checked)}
                                    />
                                    <label htmlFor={`roadmap-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Fase {index + 1}: {phase.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                </TabsContent>

                {useCase && <TabsContent value="versions">
                    <UseCaseHistory 
                        entityId={entityId} 
                        useCaseId={useCase.id} 
                        onRevert={onSuccess}
                        initialHistory={initialHistory}
                    />
                </TabsContent>}
            </div>
          </Tabs>
          
          <DialogFooter className="pt-4 border-t mt-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {useCase ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
