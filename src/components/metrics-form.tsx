'use client';

import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUseCase } from '@/lib/data';
import { Loader2, Upload, Settings, ChevronRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UseCase } from '@/lib/types';
import Papa from 'papaparse';

interface MetricsFormProps {
  useCase: UseCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type WizardStep = 'upload' | 'configure' | 'map';

export function MetricsForm({ useCase, open, onOpenChange, onSuccess }: MetricsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('upload');
  
  // File and CSV data
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  
  // Configuration
  const [separator, setSeparator] = useState(useCase.metricsConfig?.separator || ';');
  const [dateColumn, setDateColumn] = useState(useCase.metricsConfig?.dateColumn || '');
  const [dateFormat, setDateFormat] = useState(useCase.metricsConfig?.dateFormat || 'yyyy-MM');
  
  // Mapping
  const [metricDescriptions, setMetricDescriptions] = useState<Record<string, string>>(useCase.metricsConfig?.descriptions || {});

  const isConfigSaved = !!useCase.metricsConfig;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        delimiter: separator,
        complete: (results) => {
          setCsvData(results.data);
          const headers = results.meta.fields || [];
          setCsvHeaders(headers);
          if (isConfigSaved) {
            // If config exists, go straight to mapping, but let user adjust if needed
            setWizardStep('map');
          } else {
            setWizardStep('configure');
          }
        },
      });
    }
  };

  const handleSaveConfiguration = async () => {
    if (!dateColumn) {
        toast({ title: "Error", description: "Por favor selecciona la columna de fecha.", variant: "destructive" });
        return;
    }
    setWizardStep('map');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Transform CSV data into metrics object
    const newMetricsData = csvData.reduce((acc, row) => {
        const period = row[dateColumn];
        if (period) {
            if (!acc[period]) {
                acc[period] = {};
            }
            csvHeaders.forEach(header => {
                if (header !== dateColumn) {
                    acc[period][header] = row[header];
                }
            });
        }
        return acc;
    }, {});
    
    const configToSave = {
        separator,
        dateColumn,
        dateFormat,
        descriptions: metricDescriptions,
    };
    
    try {
        const success = await updateUseCase({
            entityId: useCase.entityId,
            id: useCase.id,
            metrics: { ...useCase.metrics, ...newMetricsData },
            metricsConfig: configToSave,
        });

        if (success) {
            toast({ title: 'Éxito', description: 'Métricas importadas y guardadas correctamente.' });
            onSuccess?.();
            onOpenChange(false);
        } else {
            toast({ title: 'Error', description: 'No se pudieron guardar las métricas.', variant: 'destructive' });
        }
    } catch (error) {
        console.error("Error saving metrics:", error);
        toast({ title: 'Error', description: 'Ocurrió un error inesperado.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const resetWizard = () => {
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setWizardStep('upload');
  }

  const renderContent = () => {
    switch (wizardStep) {
      case 'upload':
        return (
          <div className="text-center space-y-4 py-12">
            <h3 className="text-lg font-medium">Importar Métricas desde CSV</h3>
            <p className="text-sm text-muted-foreground">Sube un archivo para añadir o actualizar el historial de métricas.</p>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                    Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionarlo.
                </p>
                <Input id="csv-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".csv" />
            </div>
            {isConfigSaved && <p className="text-xs text-muted-foreground pt-4">Ya existe una configuración guardada. El sistema la usará para procesar el archivo.</p>}
          </div>
        );
      case 'configure':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Paso 1: Configuración de Datos</h3>
            </div>
            <p className="text-sm text-muted-foreground">Ayuda al sistema a entender tu archivo. Esta configuración se guardará para futuras cargas.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="separator">Separador de Columnas</Label>
                  <Select value={separator} onValueChange={setSeparator}>
                    <SelectTrigger id="separator"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value=";">Punto y coma (;)</SelectItem>
                      <SelectItem value=",">Coma (,)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format">Formato de Fecha</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yyyy-MM">Año-Mes (ej: 2024-10)</SelectItem>
                      <SelectItem value="yyyy-MM-dd">Año-Mes-Día (ej: 2024-10-25)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="date-column">Columna de Fecha/Período</Label>
                <Select value={dateColumn} onValueChange={setDateColumn}>
                    <SelectTrigger id="date-column"><SelectValue placeholder="Selecciona una columna..." /></SelectTrigger>
                    <SelectContent>
                        {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSaveConfiguration}>
                    Siguiente: Mapear Campos <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
          </div>
        );
      case 'map':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Paso 2: Describe tus Métricas</h3>
            </div>
            <p className="text-sm text-muted-foreground">Añade una descripción para cada métrica. Esto dará contexto a tus datos y solo necesitas hacerlo una vez.</p>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                {csvHeaders.filter(h => h !== dateColumn).map(header => (
                    <div key={header}>
                        <Label htmlFor={`desc-${header}`} className="font-semibold">{header}</Label>
                        <Input
                            id={`desc-${header}`}
                            placeholder="Añade una breve descripción..."
                            value={metricDescriptions[header] || ''}
                            onChange={(e) => setMetricDescriptions({...metricDescriptions, [header]: e.target.value})}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar y Finalizar
                </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Métricas del Caso de Uso</DialogTitle>
          <DialogDescription>Importa y gestiona las métricas de negocio, técnicas y financieras.</DialogDescription>
        </DialogHeader>

        <div className="min-h-[350px]">
          {renderContent()}
        </div>

        <DialogFooter>
          {wizardStep !== 'upload' && <Button variant="outline" onClick={resetWizard}>Volver a empezar</Button>}
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
