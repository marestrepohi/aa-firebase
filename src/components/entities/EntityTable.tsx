'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Entity } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { EntityDialog } from './EntityDialog';
import { deleteEntity } from '@/lib/data';
import { useToast } from "@/components/ui/use-toast";

interface EntityTableProps {
    initialEntities: Entity[];
    onRefresh: () => void;
}

export function EntityTable({ initialEntities, onRefresh }: EntityTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<Entity | undefined>(undefined);
    const { toast } = useToast();

    const filteredEntities = initialEntities.filter(entity =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (entity: Entity) => {
        setSelectedEntity(entity);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedEntity(undefined);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta entidad? Se borrarán todos sus casos de uso.')) {
            try {
                await deleteEntity(id);
                toast({ title: "Entidad eliminada", description: "La entidad ha sido eliminada correctamente." });
                onRefresh();
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la entidad." });
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Buscar entidades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Entidad
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Logo</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-center">Casos Activos</TableHead>
                            <TableHead className="text-center">Científicos</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEntities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No se encontraron entidades.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEntities.map((entity) => (
                                <TableRow key={entity.id}>
                                    <TableCell>
                                        <div className="relative h-10 w-10 rounded-full overflow-hidden border bg-slate-50">
                                            {entity.logo ? (
                                                <Image
                                                    src={entity.logo}
                                                    alt={entity.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/${entity.id}`} className="hover:underline text-purple-700">
                                            {entity.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-slate-500 max-w-xs truncate">
                                        {entity.description || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {entity.stats?.active || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {entity.stats?.scientists || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/${entity.id}`} className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(entity)} className="cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(entity.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <EntityDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                entity={selectedEntity}
                onSuccess={onRefresh}
            />
        </div>
    );
}

import { Building2 } from 'lucide-react';
