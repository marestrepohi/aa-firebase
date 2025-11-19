import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getMetricsHistory } from '@/lib/data';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MetricsHistorySelectorProps {
  entityId: string;
  useCaseId: string;
  category?: string;
  selectedHistoryId: string;
  onHistoryChange: (id: string) => void;
}

export function MetricsHistorySelector({
  entityId,
  useCaseId,
  category,
  selectedHistoryId,
  onHistoryChange,
}: MetricsHistorySelectorProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const historyData = await getMetricsHistory(entityId, useCaseId, category);
        setHistory(historyData);

        // Auto-select most recent upload if none selected
        if (!selectedHistoryId && historyData.length > 0) {
          onHistoryChange(historyData[0].id);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [entityId, useCaseId, category]);

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 space-y-2">
        <Label htmlFor="history-selector">Historial de Versiones</Label>
        <Select value={selectedHistoryId} onValueChange={onHistoryChange} disabled={loading}>
          <SelectTrigger id="history-selector" className="w-full">
            <SelectValue placeholder={loading ? 'Cargando...' : 'Seleccionar versión'} />
          </SelectTrigger>
          <SelectContent>
            {history.length > 0 ? (
              history.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.uploadedAt ? format(new Date(item.uploadedAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es }) : 'Sin fecha'}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">No hay historial disponible</div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
