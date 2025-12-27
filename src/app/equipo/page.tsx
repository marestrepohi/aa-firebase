'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '@/lib/types';
import { Loader2, Users } from 'lucide-react';
import { TeamTableEditor } from '@/components/team/TeamTableEditor';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadTeam = async () => {
            try {
                const response = await fetch('/api/team');
                if (response.ok) {
                    const data = await response.json();
                    setTeam(data);
                } else {
                    console.error('Failed to fetch team');
                }
            } catch (error) {
                console.error("Failed to load team", error);
            } finally {
                setLoading(false);
            }
        };

        loadTeam();
    }, []);

    const handleSaveTeam = async (newTeam: TeamMember[]) => {
        setSaving(true);
        // Optimistic update
        setTeam(newTeam);

        try {
            const response = await fetch('/api/team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ team: newTeam }),
            });

            if (!response.ok) {
                throw new Error('Failed to save changes');
            }
            toast({
                title: "Éxito",
                description: "Cambios guardados correctamente",
            });
        } catch (error) {
            console.error('Error saving team:', error);
            toast({
                title: "Error",
                description: "Error al guardar los cambios",
                variant: "destructive",
            });
            // Revert on error? For now, we keep optimistic state but warn user.
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    Directorio de Equipo
                </h1>
                <p className="text-slate-500">
                    Gestiona los miembros del equipo, sus roles y nombres. Estos cambios se guardan globalmente.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <TeamTableEditor
                    team={team}
                    onSave={handleSaveTeam}
                    saving={saving}
                />
            )}
            <Toaster />
        </div>
    );
}
