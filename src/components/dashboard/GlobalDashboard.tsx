'use client';

import { useState, useMemo } from 'react';
import { Entity, UseCase } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Building2,
    FileText,
    Users,
    AlertTriangle,
    Filter,
    Search
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { DataScientistTable } from '../data-scientist-table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface GlobalDashboardProps {
    entities: Entity[];
    allUseCases: UseCase[];
}

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const KPICard = ({ title, value, icon: Icon, color, subtext, detailContent }: any) => (
    <Card className="relative">
        <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold">{value}</div>
                {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
            </div>
            {detailContent && (
                <div className="absolute bottom-4 right-4 pb-2 pr-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-purple-600 h-8 px-2">
                                <span className="text-xs font-medium uppercase tracking-wider underline-offset-4 hover:underline">Detalle</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Detalle: {title}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                                {detailContent}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </CardContent>
    </Card>
);


const getStatusColor = (status: string) => {
    switch (status) {
        case 'Activo': return 'bg-green-100 text-green-700 hover:bg-green-100';
        case 'Inactivo': return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
        case 'Estrategico': return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
        default: return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    }
};

export function GlobalDashboard({ entities, allUseCases }: GlobalDashboardProps) {
    const [selectedEntity, setSelectedEntity] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedProjectType, setSelectedProjectType] = useState<string>('all');
    const [selectedDevType, setSelectedDevType] = useState<string>('all');
    const [selectedSuite, setSelectedSuite] = useState<string>('all');

    // Extract unique values for filters
    const projectTypes = useMemo(() => Array.from(new Set(allUseCases.map(uc => uc.tipoProyecto).filter(Boolean))), [allUseCases]);
    const devTypes = useMemo(() => Array.from(new Set(allUseCases.map(uc => uc.tipoDesarrollo).filter(Boolean))), [allUseCases]);
    const suites = useMemo(() => Array.from(new Set(allUseCases.map(uc => uc.suite).filter(Boolean))), [allUseCases]);

    // Filter Logic
    const filteredUseCases = useMemo(() => {
        return allUseCases.filter(uc => {
            const matchesEntity = selectedEntity === 'all' || uc.entityId === selectedEntity;
            const matchesStatus = selectedStatus === 'all' || uc.highLevelStatus === selectedStatus;
            const matchesProjectType = selectedProjectType === 'all' || uc.tipoProyecto === selectedProjectType;
            const matchesDevType = selectedDevType === 'all' || uc.tipoDesarrollo === selectedDevType;
            const matchesSuite = selectedSuite === 'all' || uc.suite === selectedSuite;

            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchQuery === '' ||
                uc.name.toLowerCase().includes(searchLower) ||
                (uc.objetivo && uc.objetivo.toLowerCase().includes(searchLower));

            return matchesEntity && matchesStatus && matchesProjectType && matchesDevType && matchesSuite && matchesSearch;
        });
    }, [allUseCases, selectedEntity, selectedStatus, selectedProjectType, selectedDevType, selectedSuite, searchQuery]);

    // Calculate Aggregated Metrics (Based on Filtered Data)
    const totalUseCases = filteredUseCases.length;

    // Unique entities in filtered view
    const activeEntitiesCount = new Set(filteredUseCases.map(uc => uc.entityId)).size;

    // Calculate distinct scientists by role from filtered use cases
    const ds1Set = new Set<string>();
    filteredUseCases.forEach(uc => {
        if (uc.ds1 && uc.ds1 !== '0' && uc.ds1.trim() !== '') ds1Set.add(uc.ds1.trim());
    });
    const uniqueDS1 = ds1Set.size;

    // If filtering by entity, show that entity's scientists. If global, show all.
    const relevantEntities = selectedEntity === 'all'
        ? entities
        : entities.filter(e => e.id === selectedEntity);

    const activeCount = filteredUseCases.filter(uc => uc.highLevelStatus === 'Activo').length;
    const strategicCount = filteredUseCases.filter(uc => uc.highLevelStatus === 'Estrategico').length;
    const inactiveCount = filteredUseCases.filter(uc => uc.highLevelStatus === 'Inactivo').length;

    // Prepare Chart Data: Use Cases by Entity (Top 5 from filtered set)
    const casesByEntityData = relevantEntities
        .map(e => {
            const entityCases = filteredUseCases.filter(uc => uc.entityId === e.id);
            return {
                name: e.name,
                cases: entityCases.length,
                active: entityCases.filter(uc => uc.highLevelStatus === 'Activo').length
            };
        })
        .sort((a, b) => b.cases - a.cases)
        .slice(0, 10);

    // Prepare Chart Data: Status Distribution
    const statusData = [
        { name: 'Activos', value: activeCount },
        { name: 'Estratégicos', value: strategicCount },
        { name: 'Inactivos', value: inactiveCount },
    ].filter(d => d.value > 0);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Global</h2>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o objetivo..."
                        className="pl-8 pr-4 py-2 border rounded-md w-full text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por Entidad" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las Entidades</SelectItem>
                        {entities.map(entity => (
                            <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados</SelectItem>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Estrategico">Estratégico</SelectItem>
                        {/* Add other statuses as needed */}
                    </SelectContent>
                </Select>

                <Select value={selectedProjectType} onValueChange={setSelectedProjectType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de Proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {projectTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedDevType} onValueChange={setSelectedDevType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de Desarrollo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {devTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedSuite} onValueChange={setSelectedSuite}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Suite" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {suites.map(suite => (
                            <SelectItem key={suite} value={suite}>{suite}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Casos de Uso"
                    value={totalUseCases}
                    icon={FileText}
                    color="text-blue-600"
                />
                <KPICard
                    title="Entidades Activas"
                    value={activeEntitiesCount}
                    icon={Building2}
                    color="text-green-600"
                />
                <KPICard
                    title="Científicos (DS1)"
                    value={uniqueDS1}
                    icon={Users}
                    color="text-indigo-600"
                    detailContent={<DataScientistTable useCases={filteredUseCases} />}
                />
                <KPICard
                    title="Alertas Críticas"
                    value={0} // Placeholder
                    icon={AlertTriangle}
                    color="text-red-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart: Cases by Entity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Volumen de Casos {selectedEntity !== 'all' ? '(Entidad Actual)' : 'por Entidad'}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={casesByEntityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="cases" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Total Casos" />
                                    <Bar dataKey="active" fill="#10b981" radius={[4, 4, 0, 0]} name="Casos Activos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card >

                {/* Secondary Chart: Status Distribution */}
                < Card className="col-span-3" >
                    <CardHeader>
                        <CardTitle>Distribución de Estados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card >
            </div >

            {/* Use Cases List Table */}
            < Card >
                <CardHeader>
                    <CardTitle>Listado de Casos de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Caso de Uso</TableHead>
                                    <TableHead>Entidad</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Etapa</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUseCases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No se encontraron casos de uso con los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUseCases.slice(0, 10).map((uc) => {
                                        const entityName = entities.find(e => e.id === uc.entityId)?.name || 'Desconocida';
                                        return (
                                            <TableRow key={uc.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{uc.name}</span>
                                                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{uc.objetivo}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-3 w-3 text-slate-400" />
                                                        {entityName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={getStatusColor(uc.highLevelStatus)}>
                                                        {uc.highLevelStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{uc.etapa}</TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/${uc.entityId}/casos-uso/${uc.id}`}>
                                                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                                                            Ver Detalle
                                                        </Badge>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredUseCases.length > 10 && (
                        <div className="mt-4 text-center text-sm text-slate-500">
                            Mostrando 10 de {filteredUseCases.length} casos. Usa los filtros para refinar.
                        </div>
                    )}
                </CardContent>
            </Card >
        </div >
    );
}
