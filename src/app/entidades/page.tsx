'use client';

import { useState, useEffect } from 'react';
import { EntityTable } from '@/components/entities/EntityTable';
import { createEntity, getEntities } from '@/lib/data';
import { Entity } from '@/lib/types';
import { Loader2, Database } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function EntitiesPage() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    const loadEntities = async () => {
        setLoading(true);
        try {
            const data = await getEntities();
            setEntities(data);
        } catch (error) {
            console.error("Failed to load entities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntities();
    }, []);

    const handleSeedData = async () => {
        setLoading(true);
        try {
            await createEntity({
                name: 'Banco de Bogotá',
                description: 'Entidad financiera líder en Colombia.',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Banco_de_Bogot%C3%A1_logo.svg/2560px-Banco_de_Bogot%C3%A1_logo.svg.png',
                team: [
                    { name: 'Ana Garcia', role: 'DS' },
                    { name: 'Carlos Perez', role: 'DE' }
                ]
            });
            await createEntity({
                name: 'Banco de Occidente',
                description: 'Soluciones financieras para personas y empresas.',
                logo: 'https://seeklogo.com/images/B/banco-de-occidente-logo-5058764028-seeklogo.com.png',
                team: [
                    { name: 'Maria Rodriguez', role: 'MDS' }
                ]
            });
            await loadEntities();
        } catch (error) {
            console.error("Failed to seed data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Entidades</h1>
                    <p className="text-slate-500">
                        Administra las entidades bancarias y sus configuraciones generales.
                    </p>
                </div>
                {entities.length === 0 && (
                    <Button variant="outline" onClick={handleSeedData} disabled={loading}>
                        <Database className="mr-2 h-4 w-4" />
                        Cargar Datos de Prueba
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <EntityTable initialEntities={entities} onRefresh={loadEntities} />
            )}
        </div>
    );
}
