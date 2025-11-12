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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UseCaseFormProps {
  useCase?: any;
  entityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UseCaseForm({
  useCase,
  entityId,
  open,
  onOpenChange,
  onSuccess,
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
    observaciones: useCase?.observaciones || '',
    sponsor: useCase?.sponsor || '',
    objetivo: useCase?.objetivo || '',
    solucion: useCase?.solucion || '',
    dolores: useCase?.dolores || '',
    riesgos: useCase?.riesgos || '',
    impactoEsperado: useCase?.impactoEsperado || '',
    impactoGenerado: useCase?.impactoGenerado || '',
    roadmap: useCase?.roadmap && useCase.roadmap.length > 0 ? useCase.roadmap : defaultRoadmap,
    ds1: useCase?.ds1 || '',
    ds2: useCase?.ds2 || '',
    ds3: useCase?.ds3 || '',
    ds4: useCase?.ds4 || '',
    de: useCase?.de || '',
    mds: useCase?.mds || '',
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await updateUseCase({
        ...formData,
        entityId,
      });

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="impact">Impacto</TabsTrigger>
              <TabsTrigger value="team">Equipo & Roadmap</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-grow mt-4">
              <div className="pr-6 pl-1 py-1 space-y-6">
                <TabsContent value="general">
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
                
                <TabsContent value="details">
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
                
                <TabsContent value="impact">
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="impactoEsperado">Impacto Esperado (KPIs)</Label>
                        <Textarea id="impactoEsperado" value={formData.impactoEsperado} onChange={handleInputChange} placeholder="KPIs de impacto esperado..." rows={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="impactoGenerado">Impacto Generado (KPIs)</Label>
                        <Textarea id="impactoGenerado" value={formData.impactoGenerado} onChange={handleInputChange} placeholder="KPIs de impacto generado..." rows={4} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="team">
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
                            {formData.roadmap.map((phase, index) => (
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
              </div>
            </ScrollArea>
          </Tabs>
          
          <DialogFooter className="pt-4 border-t">
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
