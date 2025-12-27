'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Image from 'next/image';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobile: boolean;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

export function Sidebar({ isOpen, setIsOpen, isMobile, isCollapsed = false, toggleCollapse }: SidebarProps) {
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

    const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
        <div className="flex flex-col h-full bg-white text-foreground">
            {/* Logo Area */}
            <div className={cn(
                "flex flex-col items-center border-b border-border transition-all duration-200",
                collapsed ? "justify-center py-4 px-2" : "py-5 px-4"
            )}>
                <div className={cn(
                    "relative shrink-0 transition-all duration-200",
                    collapsed ? "w-8 h-8" : "w-16 h-16"
                )}>
                    <Image
                        src="/logo-aa-03.png"
                        alt="Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                {!collapsed && (
                    <span className="mt-2 font-semibold text-sm text-foreground">
                        Analítica Avanzada
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                isActive
                                    ? "bg-primary text-white font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? item.title : undefined}
                        >
                            <item.icon className={cn(
                                "h-4 w-4 shrink-0",
                                isActive ? "text-white" : ""
                            )} />
                            {!collapsed && <span>{item.title}</span>}
                            {!collapsed && isActive && (
                                <ChevronRight className="ml-auto h-4 w-4 text-white/70" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-border">
                <div className={cn(
                    "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                    collapsed && "justify-center"
                )}>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        AD
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Admin User</p>
                            <p className="text-xs text-muted-foreground truncate">admin@aval.ia</p>
                        </div>
                    )}
                </div>

                {/* Toggle Button */}
                {toggleCollapse && !isMobile && (
                    <div className={cn("mt-2 flex", collapsed ? "justify-center" : "justify-end")}>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={toggleCollapse}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ChevronRight className={cn(
                                "h-4 w-4 transition-transform",
                                !collapsed && "rotate-180"
                            )} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <>
                {/* Mobile Overlay */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Mobile Drawer */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-200 lg:hidden border-r border-border",
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <SidebarContent collapsed={false} />
                </aside>
            </>
        );
    }

    // Desktop Sidebar
    return (
        <aside className={cn(
            "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-border transition-all duration-200",
            isCollapsed ? "w-16" : "w-56"
        )}>
            <SidebarContent collapsed={isCollapsed} />
        </aside>
    );
}
