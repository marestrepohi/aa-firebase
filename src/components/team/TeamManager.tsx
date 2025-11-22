'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, User, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TeamMember, TeamRole } from '@/lib/types';

interface TeamManagerProps {
    team: TeamMember[];
    onChange: (newTeam: TeamMember[]) => void;
}

const ROLES: TeamRole[] = ['DS', 'DE', 'MDS', 'Lead', 'Other'];

export function TeamManager({ team = [], onChange }: TeamManagerProps) {
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<TeamRole>('DS');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onChange([...team, { name: newName.trim(), role: newRole }]);
            setNewName('');
            setNewRole('DS');
        }
    };

    const handleRemove = (indexToRemove: number) => {
        onChange(team.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-3">
            <Label>Equipo de Científicos</Label>

            <div className="flex flex-wrap gap-2 mb-2">
                {(!team || team.length === 0) && (
                    <span className="text-sm text-slate-500 italic">No hay miembros asignados.</span>
                )}
                {team?.map((member, index) => (
                    <Badge key={`${member.name}-${index}`} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{member.name}</span>
                        </div>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-semibold text-slate-700">
                            <Briefcase className="h-2.5 w-2.5" />
                            {member.role}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-slate-300 rounded-full"
                            onClick={() => handleRemove(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                ))}
            </div>

            <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nombre o Email"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAdd(e);
                            }
                        }}
                    />
                </div>
                <div className="w-[100px] space-y-1">
                    <Select value={newRole} onValueChange={(value) => setNewRole(value as TeamRole)}>
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
                <Button
                    type="button"
                    onClick={handleAdd}
                    variant="outline"
                    disabled={!newName.trim()}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
