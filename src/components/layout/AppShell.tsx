'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setIsDesktopCollapsed(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isMobile={isMobile}
                isCollapsed={isDesktopCollapsed}
                toggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            />

            {/* Main Content Wrapper */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-200",
                isDesktopCollapsed ? 'lg:pl-16' : 'lg:pl-56'
            )}>

                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-border h-12 flex items-center px-4">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="ml-3 font-semibold text-sm">Analítica Avanzada</span>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
