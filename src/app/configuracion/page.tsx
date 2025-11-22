'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
                <p className="text-slate-500">
                    Administra la configuración global de la plataforma.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <Database className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium">
                                Base de Datos
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Configuración de conexión y backups. (Próximamente)
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium">
                                Seguridad
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Roles, permisos y auditoría. (Próximamente)
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium">
                                Notificaciones
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Alertas y preferencias de correo. (Próximamente)
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
