'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    Menu,
    X,
    ChevronRight,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobile: boolean;
}

export function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        {
            title: 'Casos de Uso',
            href: '/',
            icon: LayoutDashboard
        },
        {
            title: 'Entidades',
            href: '/entidades',
            icon: Building2
        },
        {
            title: 'Equipo',
            href: '/equipo',
            icon: Users
        },
        {
            title: 'Configuración',
            href: '/configuracion',
            icon: Settings
        }
    ];

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [pathname, isMobile, setIsOpen]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-900">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/logo-aa-01.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900">Aval IA</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-900")} />
                            <span className="font-medium text-sm">{item.title}</span>
                            {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary/50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-slate-900">Admin User</p>
                        <p className="text-xs text-slate-500 truncate">admin@aval.ia</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <>
                {/* Mobile Overlay */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Mobile Drawer */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-300 ease-in-out lg:hidden",
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <SidebarContent />
                </aside>
            </>
        );
    }

    // Desktop Sidebar
    return (
        <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30 bg-white">
            <SidebarContent />
        </aside>
    );
}
