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
  const [formData, setFormData] = useState({
    id: useCase?.id || '',
    name: useCase?.name || '',
    description: useCase?.description || '',
    status: useCase?.status || 'En Estimación',
    highLevelStatus: useCase?.highLevelStatus || 'Activo',
    tipoProyecto: useCase?.tipoProyecto || '',
    tipoDesarrollo: useCase?.tipoDesarrollo || '',
    observaciones: useCase?.observaciones || '',
    sharepoint: useCase?.sharepoint || '',
    jira: useCase?.jira || '',
    actividadesSharepoint: useCase?.actividadesSharepoint || '',
    actividadesJira: useCase?.actividadesJira || '',
  });

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{useCase ? 'Editar Caso de Uso' : 'Nuevo Caso de Uso'}</DialogTitle>
          <DialogDescription>
            {useCase
              ? 'Actualiza la información del caso de uso'
              : 'Crea un nuevo caso de uso en el sistema'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="ej: proyecto-123"
                  required
                  disabled={!!useCase} // Can't change ID of existing use case
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Modelo de Fraude"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del caso de uso..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En Estimación">En Estimación</SelectItem>
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
                <Select
                  value={formData.highLevelStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, highLevelStatus: value })
                  }
                >
                  <SelectTrigger id="highLevelStatus">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Estrategico">Estratégico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoProyecto">Tipo de Proyecto</Label>
                <Select
                  value={formData.tipoProyecto}
                  onValueChange={(value) => setFormData({ ...formData, tipoProyecto: value })}
                >
                  <SelectTrigger id="tipoProyecto">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Predictivo">Predictivo</SelectItem>
                    <SelectItem value="Descriptivo">Descriptivo</SelectItem>
                    <SelectItem value="Prescriptivo">Prescriptivo</SelectItem>
                    <SelectItem value="Generativo">Generativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoDesarrollo">Tipo de Desarrollo</Label>
                <Select
                  value={formData.tipoDesarrollo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipoDesarrollo: value })
                  }
                >
                  <SelectTrigger id="tipoDesarrollo">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modelo">Modelo</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="Dashboard">Dashboard</SelectItem>
                    <SelectItem value="Consultoría">Consultoría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sharepoint">SharePoint URL</Label>
                <Input
                  id="sharepoint"
                  type="url"
                  value={formData.sharepoint}
                  onChange={(e) => setFormData({ ...formData, sharepoint: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actividadesSharepoint"># Actividades SharePoint</Label>
                <Input
                  id="actividadesSharepoint"
                  value={formData.actividadesSharepoint}
                  onChange={(e) =>
                    setFormData({ ...formData, actividadesSharepoint: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jira">Jira URL</Label>
                <Input
                  id="jira"
                  type="url"
                  value={formData.jira}
                  onChange={(e) => setFormData({ ...formData, jira: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actividadesJira"># Actividades Jira</Label>
                <Input
                  id="actividadesJira"
                  value={formData.actividadesJira}
                  onChange={(e) =>
                    setFormData({ ...formData, actividadesJira: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {useCase ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
