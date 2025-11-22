'use client';

import { useState, useEffect } from 'react';
import { getEntities } from '@/lib/data';
import { Entity, TeamRole } from '@/lib/types';
import { Loader2, User, Building2, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface Scientist {
    name: string;
    role: TeamRole;
    entities: { id: string; name: string }[];
}

export default function TeamPage() {
    const [scientists, setScientists] = useState<Scientist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTeam = async () => {
            try {
                const entities = await getEntities();
                const scientistMap = new Map<string, { role: TeamRole; entities: { id: string; name: string }[] }>();

                entities.forEach(entity => {
                    if (entity.team && Array.isArray(entity.team)) {
                        entity.team.forEach(member => {
                            // Handle both legacy string[] and new TeamMember[]
                            const name = typeof member === 'string' ? member : member.name;
                            const role = typeof member === 'string' ? 'DS' : member.role;

                            const current = scientistMap.get(name) || { role, entities: [] };
                            current.entities.push({ id: entity.id, name: entity.name });
                            // Update role if it was default but now has specific
                            if (current.role === 'DS' && role !== 'DS') {
                                current.role = role;
                            }
                            scientistMap.set(name, current);
                        });
                    }
                });

                const scientistList: Scientist[] = Array.from(scientistMap.entries()).map(([name, data]) => ({
                    name,
                    role: data.role,
                    entities: data.entities
                })).sort((a, b) => a.name.localeCompare(b.name));

                setScientists(scientistList);
            } catch (error) {
                console.error("Failed to load team", error);
            } finally {
                setLoading(false);
            }
        };

        loadTeam();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Directorio de Equipo</h1>
                <p className="text-slate-500">
                    Vista global de todos los científicos y miembros de equipo asignados a las entidades.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            ) : scientists.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <User className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900">No hay miembros de equipo</h3>
                    <p className="mt-1 text-sm text-slate-500">Asigna científicos a las entidades para verlos aquí.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {scientists.map((scientist) => (
                        <Card key={scientist.name} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base font-medium truncate" title={scientist.name}>
                                        {scientist.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {scientist.role}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 mt-2">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Asignado a:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {scientist.entities.map(entity => (
                                            <Link key={entity.id} href={`/${entity.id}`}>
                                                <Badge variant="outline" className="hover:bg-slate-100 cursor-pointer gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {entity.name}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
