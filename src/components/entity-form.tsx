'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateEntity } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EntityFormProps {
  entity?: {
    id: string;
    name: string;
    description: string;
    logo: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EntityForm({ entity, open, onOpenChange, onSuccess }: EntityFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: entity?.id || '',
    name: entity?.name || '',
    description: entity?.description || '',
    logo: entity?.logo || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await updateEntity(formData);

      if (success) {
        toast({
          title: 'Éxito',
          description: entity ? 'Entidad actualizada correctamente' : 'Entidad creada correctamente',
        });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar la entidad',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving entity:', error);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{entity ? 'Editar Entidad' : 'Nueva Entidad'}</DialogTitle>
          <DialogDescription>
            {entity
              ? 'Actualiza la información de la entidad'
              : 'Crea una nueva entidad en el sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID *</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="ej: adl"
              required
              disabled={!!entity} // Can't change ID of existing entity
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej: Aval Digital Labs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la entidad..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="/logos/entidad.png"
            />
            {formData.logo && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={formData.logo}
                  alt="Logo preview"
                  className="h-12 w-12 object-contain rounded border"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-sm text-muted-foreground">Vista previa</span>
              </div>
            )}
          </div>

          <DialogFooter>
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
              {entity ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
