'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getMetricsPeriods } from '@/lib/data';

interface MetricsPeriodSelectorProps {
  entityId: string;
  useCaseId: string;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onNewPeriod?: () => void;
}

export function MetricsPeriodSelector({
  entityId,
  useCaseId,
  selectedPeriod,
  onPeriodChange,
  onNewPeriod,
}: MetricsPeriodSelectorProps) {
  const [periods, setPeriods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPeriods() {
      setLoading(true);
      try {
        const periodsData = await getMetricsPeriods(entityId, useCaseId);
        const periodsList = periodsData.map((p: any) => p.period).sort().reverse();
        setPeriods(periodsList);

        // Auto-select most recent period if none selected
        if (!selectedPeriod && periodsList.length > 0) {
          onPeriodChange(periodsList[0]);
        }
      } catch (error) {
        console.error('Error loading periods:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPeriods();
  }, [entityId, useCaseId]);

  // Generate suggested periods (current + last 4 quarters)
  const generateSuggestedPeriods = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarter = Math.floor(month / 3) + 1;

    const suggestions: string[] = [];
    let currentYear = year;
    let currentQuarter = quarter;

    for (let i = 0; i < 5; i++) {
      suggestions.push(`${currentYear}-Q${currentQuarter}`);
      currentQuarter--;
      if (currentQuarter === 0) {
        currentQuarter = 4;
        currentYear--;
      }
    }

    return suggestions;
  };

  const suggestedPeriods = generateSuggestedPeriods();

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 space-y-2">
        <Label htmlFor="period-selector">Período</Label>
        <Select value={selectedPeriod} onValueChange={onPeriodChange} disabled={loading}>
          <SelectTrigger id="period-selector" className="w-full">
            <SelectValue placeholder={loading ? 'Cargando...' : 'Seleccionar período'} />
          </SelectTrigger>
          <SelectContent>
            {periods.length > 0 ? (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Períodos existentes
                </div>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </>
            ) : null}

            {suggestedPeriods.some((p) => !periods.includes(p)) && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                  Períodos sugeridos
                </div>
                {suggestedPeriods
                  .filter((p) => !periods.includes(p))
                  .map((period) => (
                    <SelectItem key={period} value={period}>
                      {period} (nuevo)
                    </SelectItem>
                  ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {onNewPeriod && (
        <Button type="button" variant="outline" size="icon" onClick={onNewPeriod}>
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
