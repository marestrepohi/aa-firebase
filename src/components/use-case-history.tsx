'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUseCaseHistory, revertUseCaseVersion } from '@/lib/data';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface UseCaseHistoryProps {
  entityId: string;
  useCaseId: string;
  onRevert?: () => void;
}

export function UseCaseHistory({ entityId, useCaseId, onRevert }: UseCaseHistoryProps) {
  const { toast } = useToast();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReverting, setIsReverting] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const historyData = await getUseCaseHistory(entityId, useCaseId);
        setHistory(historyData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el historial de versiones.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [entityId, useCaseId, toast]);

  const handleRevert = async (versionId: string) => {
    setIsReverting(versionId);
    const result = await revertUseCaseVersion(entityId, useCaseId, versionId);

    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Se ha revertido el caso de uso a la versión seleccionada.',
      });
      if (onRevert) onRevert();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo revertir la versión.',
        variant: 'destructive',
      });
    }
    setIsReverting(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <History className="mx-auto h-12 w-12" />
        <p className="mt-4">No hay historial de versiones para este caso de uso.</p>
        <p className="text-xs mt-2">Los cambios se guardarán como una nueva versión al actualizar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Historial de Versiones</h3>
      <div className="border rounded-lg">
        <ul className="divide-y">
          {history.map((version) => (
            <li key={version.versionId} className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium">
                  Versión del {format(new Date(version.versionId), 'dd/MM/yyyy, HH:mm:ss')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Modificado por: (No disponible)
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!!isReverting}
                  >
                    {isReverting === version.versionId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Revertir'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres revertir?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción restaurará el caso de uso a la versión del <span className="font-semibold">{format(new Date(version.versionId), 'dd/MM/yyyy')}</span>. El estado actual se guardará como una nueva versión en el historial.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRevert(version.versionId)}>
                      Sí, revertir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
