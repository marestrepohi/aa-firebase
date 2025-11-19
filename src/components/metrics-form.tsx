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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateUseCase, saveMetrics } from '@/lib/data';
import { Loader2, Upload, Settings, ChevronRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UseCase, MetricCategory, UploadedFile } from '@/lib/types';
import Papa from 'papaparse';
import { UploadedFilesHistory } from './uploaded-files-history';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type WizardStep = 'upload' | 'configure' | 'map';

interface ImporterState {
  step: WizardStep;
  file: File | null;
  csvData: any[];
  csvHeaders: string[];
  csvPreview: any[];
  dateColumn: string;
  dateFormat: string;
  separator: string;
  descriptions: Record<string, string>;
  history: UploadedFile[];
}

interface MetricsFormProps {
  useCase: UseCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const getInitialImporterState = (useCase: UseCase, category: MetricCategory): ImporterState => {
  const config = useCase.metricsConfig?.[category];
  const history = (useCase.uploadedFiles || []).filter(f => f.category === category);
  return {
    step: 'upload',
    file: null,
    csvData: [],
    csvHeaders: [],
    csvPreview: [],
    dateColumn: '', // Not used anymore
    dateFormat: config?.dateFormat || 'yyyy-MM',
    separator: config?.separator || ';',
    descriptions: config?.descriptions || {},
    history: history,
  };
};

// ... (ImporterTabContent needs update too, see below)

const ImporterTabContent = ({ useCase, category, state, setState, onHistoryChange }: {
  useCase: UseCase,
  category: MetricCategory,
  state: ImporterState,
  setState: (newState: Partial<ImporterState>) => void,
  onHistoryChange: () => void,
}) => {
  const isConfigSaved = !!useCase.metricsConfig?.[category];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setState({ file: uploadedFile });

      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        delimiter: state.separator,
        complete: (results) => {
          const headers = results.meta.fields || [];
          setState({
            csvData: results.data,
            csvHeaders: headers,
            csvPreview: results.data.slice(0, 5),
            step: isConfigSaved ? 'map' : 'configure'
          });
        },
      });
    }
  };

  const handleSaveConfiguration = () => {
    // No longer need to validate date column
    setState({ step: 'map' });
  };

  const resetWizard = () => {
    setState({ file: null, csvData: [], csvHeaders: [], csvPreview: [], step: 'upload' });
  };

  const { toast } = useToast();

  switch (state.step) {
    case 'upload':
      return (
        <div className="space-y-6 py-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Sube un archivo para añadir o actualizar el historial de métricas de esta categoría.</p>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionarlo.
              </p>
              <Input id={`csv-upload-${category}`} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".csv" />
            </div>
            {isConfigSaved && <p className="text-xs text-muted-foreground pt-4">Ya existe una configuración guardada para esta categoría. El sistema la usará para procesar el archivo.</p>}
          </div>
          <UploadedFilesHistory
            files={state.history}
            entityId={useCase.entityId}
            useCaseId={useCase.id}
            onFileDeleted={onHistoryChange}
          />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`separator-${category}`}>Separador de Columnas</Label>
                <Select value={state.separator} onValueChange={(val) => setState({ separator: val })}>
                  <SelectTrigger id={`separator-${category}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=";">Punto y coma (;)</SelectItem>
                    <SelectItem value=",">Coma (,)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Date format might still be useful if dates are inside the data, but not for grouping */}
            </div>

            <div className="space-y-2">
              <Label>Vista Previa del Archivo</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-48">
                  <UiTable className="text-xs">
                    <TableHeader>
                      <TableRow>
                        {state.csvHeaders.map(h => <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.csvPreview.map((row, i) => (
                        <TableRow key={i}>
                          {state.csvHeaders.map(h => <TableCell key={h} className="whitespace-nowrap">{row[h]}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </UiTable>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={resetWizard}>Volver</Button>
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
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {state.csvHeaders.map(header => (
              <div key={header}>
                <Label htmlFor={`desc-${category}-${header}`} className="font-semibold">{header}</Label>
                <Input
                  id={`desc-${category}-${header}`}
                  placeholder="Añade una breve descripción..."
                  value={state.descriptions[header] || ''}
                  onChange={(e) => {
                    const newDescriptions = { ...state.descriptions, [header]: e.target.value };
                    setState({ descriptions: newDescriptions });
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={resetWizard}>Volver</Button>
            {/* The final save button is outside this component */}
          </div>
        </div>
      );
  }
};

export function MetricsForm({ useCase, open, onOpenChange, onSuccess }: MetricsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [importers, setImporters] = useState<Record<MetricCategory, ImporterState>>({
    financial: getInitialImporterState(useCase, 'financial'),
    business: getInitialImporterState(useCase, 'business'),
    technical: getInitialImporterState(useCase, 'technical'),
  });

  const updateImporterState = (category: MetricCategory, newState: Partial<ImporterState>) => {
    setImporters(prev => ({
      ...prev,
      [category]: { ...prev[category], ...newState },
    }));
  };

  const handleHistoryChange = () => {
    // This function will just trigger a reload of the component state
    if (onSuccess) onSuccess();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const newMetricsConfig: any = { ...(useCase.metricsConfig || {}) };
    const newUploadedFiles = [] as any[];
    let successCount = 0;
    let failCount = 0;

    for (const cat of Object.keys(importers) as MetricCategory[]) {
      const state = importers[cat];
      if (state.csvData.length === 0) continue;

      // Create new uploaded file record
      const fileId = `${Date.now()}-${state.file?.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;

      newUploadedFiles.push({
        id: fileId,
        name: state.file!.name,
        category: cat,
        rowCount: state.csvData.length,
        periods: [], // No longer relevant
        uploadedAt: new Date().toISOString()
      });

      // Update config
      newMetricsConfig[cat] = {
        separator: state.separator,
        dateColumn: '',
        dateFormat: state.dateFormat,
        descriptions: state.descriptions,
      };

      // Save metrics data directly
      try {
        // We send the raw CSV data as 'data' field
        // We also include descriptions if needed, or just the data
        // Extract summary from the first row of CSV data for quick access (e.g. for trend charts)
        const summary = state.csvData.length > 0 ? state.csvData[0] : {};

        const metricsPayload = {
          data: state.csvData,
          fileId: fileId,
          descriptions: state.descriptions,
          ...summary // Spread summary at top level for getMetricsHistory to pick up
        };

        const saved = await saveMetrics({
          entityId: useCase.entityId,
          useCaseId: useCase.id,
          category: cat,
          metrics: metricsPayload
        });

        if (saved) successCount++;
        else failCount++;

      } catch (e) {
        console.error(`Error saving ${cat} metrics:`, e);
        failCount++;
      }
    }

    try {
      // Save file history and config
      if (newUploadedFiles.length > 0 || Object.keys(newMetricsConfig).length > 0) {
        await updateUseCase({
          entityId: useCase.entityId,
          id: useCase.id,
          metricsConfig: newMetricsConfig,
          newUploadedFiles: newUploadedFiles,
        });
      }

      if (failCount === 0) {
        toast({ title: 'Éxito', description: 'Métricas importadas y guardadas correctamente.' });
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast({ title: 'Advertencia', description: `Se guardaron ${successCount} categorías, pero fallaron ${failCount}.`, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error saving use case details:", error);
      toast({ title: 'Error', description: 'Ocurrió un error al actualizar el historial.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnyReadyForSave = Object.values(importers).some(s => s.step === 'map');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Métricas del Caso de Uso</DialogTitle>
          <DialogDescription>Importa y gestiona las métricas de negocio, técnicas y financieras por separado.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial">Financieras</TabsTrigger>
            <TabsTrigger value="business">De Negocio</TabsTrigger>
            <TabsTrigger value="technical">Técnicas</TabsTrigger>
          </TabsList>
          <div className="mt-4 min-h-[400px]">
            <TabsContent value="financial">
              <ImporterTabContent useCase={useCase} category="financial" state={importers.financial} setState={(s) => updateImporterState('financial', s)} onHistoryChange={handleHistoryChange} />
            </TabsContent>
            <TabsContent value="business">
              <ImporterTabContent useCase={useCase} category="business" state={importers.business} setState={(s) => updateImporterState('business', s)} onHistoryChange={handleHistoryChange} />
            </TabsContent>
            <TabsContent value="technical">
              <ImporterTabContent useCase={useCase} category="technical" state={importers.technical} setState={(s) => updateImporterState('technical', s)} onHistoryChange={handleHistoryChange} />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {isAnyReadyForSave && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar y Finalizar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
