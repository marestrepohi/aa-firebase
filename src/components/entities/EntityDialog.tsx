'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Entity, TeamMember } from '@/lib/types';
import { createEntity, updateEntity } from '@/lib/data';
import { useToast } from "@/components/ui/use-toast";

import { TeamManager } from '@/components/team/TeamManager';

interface EntityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: Entity;
    onSuccess: () => void;
}

export function EntityDialog({ open, onOpenChange, entity, onSuccess }: EntityDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (entity) {
            setName(entity.name);
            setDescription(entity.description || '');
            setLogo(entity.logo || '');
            setTeam(entity.team || []);
        } else {
            setName('');
            setDescription('');
            setLogo('');
            setTeam([]);
        }
    }, [entity, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (entity) {
                await updateEntity({ id: entity.id, name, description, logo, team });
                toast({ title: "Entidad actualizada", description: "Los cambios se han guardado correctamente." });
            } else {
                await createEntity({ name, description, logo, team });
                toast({ title: "Entidad creada", description: "La nueva entidad ha sido creada." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Hubo un problema al guardar la entidad." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{entity ? 'Editar Entidad' : 'Nueva Entidad'}</DialogTitle>
                        <DialogDescription>
                            {entity ? 'Modifica los detalles de la entidad aquí.' : 'Ingresa la información para crear una nueva entidad.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Descripción
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="logo" className="text-right">
                                Logo URL
                            </Label>
                            <Input
                                id="logo"
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                className="col-span-3"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="col-span-4 border-t pt-4 mt-2">
                            <TeamManager team={team} onChange={setTeam} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
