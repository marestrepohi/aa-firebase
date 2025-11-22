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
            title: 'Dashboard Global',
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
        <div className="flex flex-col h-full bg-slate-900 text-white">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/logo-aa-02.png"
                            alt="Logo"
                            fill
                            className="object-contain brightness-0 invert"
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Aval IA</span>
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
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                            <span className="font-medium text-sm">{item.title}</span>
                            {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/50">
                    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Admin User</p>
                        <p className="text-xs text-slate-400 truncate">admin@aval.ia</p>
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
                        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 ease-in-out lg:hidden",
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
        <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30 border-r border-slate-200 bg-slate-900">
            <SidebarContent />
        </aside>
    );
}
