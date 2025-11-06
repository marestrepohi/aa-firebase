'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { saveMetrics } from '@/lib/data';
import { Loader2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricsPeriodSelector } from './metrics-period-selector';
import type { Metric } from '@/lib/types';

interface MetricsFormProps {
  entityId: string;
  useCaseId: string;
  initialPeriod?: string;
  initialMetrics?: {
    general: Metric[];
    financial: Metric[];
    business: Metric[];
    technical: Metric[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type MetricCategory = 'general' | 'financial' | 'business' | 'technical';

export function MetricsForm({
  entityId,
  useCaseId,
  initialPeriod = '',
  initialMetrics,
  open,
  onOpenChange,
  onSuccess,
}: MetricsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [metrics, setMetrics] = useState(
    initialMetrics || {
      general: [],
      financial: [],
      business: [],
      technical: [],
    }
  );

  const addMetric = (category: MetricCategory) => {
    setMetrics({
      ...metrics,
      [category]: [...metrics[category], { label: '', value: '' }],
    });
  };

  const removeMetric = (category: MetricCategory, index: number) => {
    setMetrics({
      ...metrics,
      [category]: metrics[category].filter((_, i) => i !== index),
    });
  };

  const updateMetric = (
    category: MetricCategory,
    index: number,
    field: 'label' | 'value',
    value: string
  ) => {
    const updated = [...metrics[category]];
    updated[index] = { ...updated[index], [field]: value };
    setMetrics({
      ...metrics,
      [category]: updated,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPeriod) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un período',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert all metric values to strings
      const metricsToSave = {
        general: metrics.general.map(m => ({ label: m.label, value: String(m.value) })),
        financial: metrics.financial.map(m => ({ label: m.label, value: String(m.value) })),
        business: metrics.business.map(m => ({ label: m.label, value: String(m.value) })),
        technical: metrics.technical.map(m => ({ label: m.label, value: String(m.value) })),
      };

      const success = await saveMetrics({
        entityId,
        useCaseId,
        period: selectedPeriod,
        metrics: metricsToSave,
      });

      if (success) {
        toast({
          title: 'Éxito',
          description: `Métricas guardadas para ${selectedPeriod}`,
        });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron guardar las métricas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMetricsSection = (category: MetricCategory, title: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addMetric(category)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Agregar
        </Button>
      </div>

      {metrics[category].length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay métricas. Haz clic en "Agregar" para crear una.
        </p>
      ) : (
        <div className="space-y-3">
          {metrics[category].map((metric, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Nombre de la métrica"
                  value={metric.label}
                  onChange={(e) => updateMetric(category, index, 'label', e.target.value)}
                />
              </div>
              <div className="w-32">
                <Input
                  placeholder="Valor"
                  value={metric.value}
                  onChange={(e) => updateMetric(category, index, 'value', e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMetric(category, index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Métricas</DialogTitle>
          <DialogDescription>
            Edita las métricas del caso de uso por período
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MetricsPeriodSelector
            entityId={entityId}
            useCaseId={useCaseId}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="financial">Financiero</TabsTrigger>
              <TabsTrigger value="business">Negocio</TabsTrigger>
              <TabsTrigger value="technical">Técnico</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <div className="pr-4">
                <TabsContent value="general">
                  {renderMetricsSection('general', 'Métricas Generales')}
                </TabsContent>

                <TabsContent value="financial">
                  {renderMetricsSection('financial', 'Métricas Financieras')}
                </TabsContent>

                <TabsContent value="business">
                  {renderMetricsSection('business', 'Métricas de Negocio')}
                </TabsContent>

                <TabsContent value="technical">
                  {renderMetricsSection('technical', 'Métricas Técnicas')}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedPeriod}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Métricas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
