
'use client';

import { useState } from 'react';
import { TeamMember, TeamRole } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Save, X, User } from "lucide-react";

interface TeamTableEditorProps {
    team: TeamMember[];
    onSave: (newTeam: TeamMember[]) => void;
    saving: boolean;
}

const ROLES: TeamRole[] = ['DS', 'DE', 'MDS', 'Lead', 'Other'];

export function TeamTableEditor({ team, onSave, saving }: TeamTableEditorProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState<TeamRole>('DS');

    // Add New Member State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<TeamRole>('DS');

    const handleEditStart = (index: number, member: TeamMember) => {
        setEditingIndex(index);
        setEditName(member.name);
        setEditRole(member.role);
    };

    const handleEditCancel = () => {
        setEditingIndex(null);
        setEditName('');
    };

    const handleEditSave = (index: number) => {
        const updatedTeam = [...team];
        updatedTeam[index] = { ...updatedTeam[index], name: editName, role: editRole };
        onSave(updatedTeam);
        setEditingIndex(null);
    };

    const handleDelete = (index: number) => {
        if (confirm('¿Estás seguro de eliminar a este miembro del equipo?')) {
            const updatedTeam = team.filter((_, i) => i !== index);
            onSave(updatedTeam);
        }
    };

    const handleAddMember = () => {
        if (newName.trim()) {
            onSave([...team, { name: newName.trim(), role: newRole }]);
            setNewName('');
            setNewRole('DS');
            setIsAddOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Miembros del Equipo</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Agregar Miembro
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Miembro</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label>Nombre</label>
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Nombre completo"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label>Rol</label>
                                <Select value={newRole} onValueChange={(v) => setNewRole(v as TeamRole)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleAddMember} disabled={!newName.trim()}>Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {team.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-slate-500">
                                    No hay miembros en el equipo. Agrega uno nuevo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            team.map((member, index) => (
                                <TableRow key={`${member.name}-${index}`}>
                                    <TableCell>
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {editingIndex === index ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8"
                                            />
                                        ) : (
                                            member.name
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingIndex === index ? (
                                            <Select value={editRole} onValueChange={(v) => setEditRole(v as TeamRole)}>
                                                <SelectTrigger className="h-8 w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLES.map(role => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="secondary">{member.role}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingIndex === index ? (
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => handleEditSave(index)}>
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={handleEditCancel}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => handleEditStart(index, member)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {saving && (
                <div className="text-xs text-slate-500 text-right animate-pulse">
                    Guardando cambios...
                </div>
            )}
        </div>
    );
}
