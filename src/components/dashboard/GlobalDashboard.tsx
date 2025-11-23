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

interface GlobalDashboardProps {
    entities: Entity[];
    allUseCases: UseCase[];
}

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

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

    // Calculate unique scientists (This is tricky with filters, we'll approximate based on entities involved or keep global)
    // If filtering by entity, show that entity's scientists. If global, show all.
    const relevantEntities = selectedEntity === 'all'
        ? entities
        : entities.filter(e => e.id === selectedEntity);

    const allScientists = new Set<string>();
    relevantEntities.forEach(e => e.team?.forEach(member => {
        const name = typeof member === 'string' ? member : member.name;
        allScientists.add(name);
    }));
    const totalScientists = allScientists.size;

    const activeCount = filteredUseCases.filter(uc => uc.highLevelStatus === 'Activo').length;
    const strategicCount = filteredUseCases.filter(uc => uc.highLevelStatus === 'Estrategico').length;
    const inactiveCount = filteredUseCases.filter(uc => uc.highLevelStatus === 'Inactivo').length;

    // Prepare Chart Data: Use Cases by Entity (Top 5 from filtered set)
    // If specific entity selected, this chart might be less useful, maybe show breakdown by stage instead?
    // For now, let's keep it consistent but filtered.
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
        .slice(0, 10); // Show more if needed

    // Prepare Chart Data: Status Distribution
    const statusData = [
        { name: 'Activos', value: activeCount },
        { name: 'Estratégicos', value: strategicCount },
        { name: 'Inactivos', value: inactiveCount },
    ].filter(d => d.value > 0);

    const KPICard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold">{value}</div>
                    {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
                </div>
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col gap-4">

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {/* Search */}
                    <div className="relative col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                            placeholder="Buscar casos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                            <Filter className="w-4 h-4 mr-2 text-slate-500" />
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Estrategico">Estratégico</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Project Type Filter */}
                    <Select value={selectedProjectType} onValueChange={setSelectedProjectType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo Proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Tipos Proyecto</SelectItem>
                            {projectTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Dev Type Filter */}
                    <Select value={selectedDevType} onValueChange={setSelectedDevType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo Desarrollo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Tipos Des.</SelectItem>
                            {devTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Suite Filter */}
                    <Select value={selectedSuite} onValueChange={setSelectedSuite}>
                        <SelectTrigger>
                            <SelectValue placeholder="Suite" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Suites</SelectItem>
                            {suites.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title={selectedEntity === 'all' ? "Entidades Activas" : "Entidad Seleccionada"}
                    value={selectedEntity === 'all' ? activeEntitiesCount : 1}
                    icon={Building2}
                    color="text-blue-600"
                    subtext={selectedEntity === 'all' ? `De ${entities.length} totales` : entities.find(e => e.id === selectedEntity)?.name}
                />
                <KPICard
                    title="Casos de Uso"
                    value={totalUseCases}
                    icon={FileText}
                    color="text-purple-600"
                    subtext={`${activeCount} activos`}
                />
                <KPICard
                    title="Científicos Asignados"
                    value={totalScientists}
                    icon={Users}
                    color="text-green-600"
                />
                <KPICard
                    title="Alertas"
                    value="0"
                    icon={AlertTriangle}
                    color="text-red-600"
                    subtext="Sin incidentes críticos"
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
                </Card>

                {/* Secondary Chart: Status Distribution */}
                <Card className="col-span-3">
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
                </Card>
            </div>

            {/* Use Cases List Table */}
            <Card>
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
                                                    <Link href={`/${uc.entityId}/${uc.id}`}>
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
            </Card>
        </div>
    );
}
