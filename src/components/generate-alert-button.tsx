'use client';

import { useState } from 'react';
import { Bot, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { generateAlert, SmartAlertingSystemOutput } from '@/ai/flows/smart-alerting-system';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { UseCase } from '@/lib/types';

function toRecord(metrics: any[]) {
    return metrics.reduce((acc, metric) => {
        acc[metric.label] = `${metric.value}${metric.unit || ''}`;
        return acc;
    }, {} as Record<string, any>);
}

export function GenerateAlertButton({ useCase }: { useCase: UseCase }) {
  const [alerts, setAlerts] = useState<SmartAlertingSystemOutput['alerts'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerateAlerts = async () => {
    setIsLoading(true);
    setIsDialogOpen(true);
    setAlerts(null);
    try {
      const result = await generateAlert({
        generalMetrics: toRecord(useCase.metrics.general),
        financialMetrics: toRecord(useCase.metrics.financial),
        businessMetrics: toRecord(useCase.metrics.business),
        technicalMetrics: toRecord(useCase.metrics.technical),
      });
      setAlerts(result.alerts);
    } catch (error) {
      console.error('Failed to generate alerts:', error);
      setAlerts([]); // To show an error message
    }
    setIsLoading(false);
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'medium':
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <ShieldAlert className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    const variant = severity === 'high' ? 'destructive' : severity === 'medium' ? 'secondary' : 'outline';
    return <Badge variant={variant} className={`capitalize ${severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}`}>{severity}</Badge>
  }


  return (
    <>
      <Button onClick={handleGenerateAlerts} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Bot className="mr-2 h-4 w-4" />
            Generate Smart Alerts
          </>
        )}
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Bot /> Smart Alerting System
            </AlertDialogTitle>
            <AlertDialogDescription>
              AI-powered analysis of the use case metrics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Analyzing metrics...</p>
              </div>
            )}
            {alerts && alerts.length > 0 && (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex gap-4 rounded-lg border p-4">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{alert.metric}</p>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {alerts && alerts.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No significant alerts generated. All metrics appear to be within normal parameters.</p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
