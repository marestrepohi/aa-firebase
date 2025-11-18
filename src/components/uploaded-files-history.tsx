'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog"
import { deleteUploadedFile } from '@/lib/data';
import type { UploadedFile } from '@/lib/types';

interface UploadedFilesHistoryProps {
  files: UploadedFile[];
  entityId: string;
  useCaseId: string;
  onFileDeleted: () => void;
}

export function UploadedFilesHistory({ files, entityId, useCaseId, onFileDeleted }: UploadedFilesHistoryProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);

  const handleDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(fileToDelete.id);
    const result = await deleteUploadedFile(entityId, useCaseId, fileToDelete.id);

    if (result.success) {
      toast({
        title: 'Éxito',
        description: `El archivo "${fileToDelete.name}" y sus métricas asociadas han sido eliminados.`,
      });
      onFileDeleted();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo eliminar el archivo.',
        variant: 'destructive',
      });
    }
    setIsDeleting(null);
    setFileToDelete(null);
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">No hay archivos subidos para esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">Historial de Archivos Subidos</h4>
      <div className="border rounded-lg max-h-48 overflow-y-auto">
        <ul className="divide-y">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.uploadedAt ? `Subido el: ${format(new Date(file.uploadedAt), 'dd/MM/yyyy, HH:mm')}` : 'Fecha desconocida'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!!isDeleting}
                onClick={() => setFileToDelete(file)}
              >
                {isDeleting === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive/70" />}
              </Button>
            </li>
          ))}
        </ul>
      </div>

       <AlertDialog open={!!fileToDelete} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará el archivo <span className="font-semibold">{fileToDelete?.name}</span> y todas las métricas asociadas a él para los períodos <span className="font-semibold">{fileToDelete?.periods?.join(', ')}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
