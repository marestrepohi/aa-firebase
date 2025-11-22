'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive check
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isMobile={isMobile}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">

                {/* Mobile Header Trigger */}
                <div className="lg:hidden sticky top-0 z-20 bg-white border-b px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-slate-700" />
                        </Button>
                        <span className="font-bold text-lg text-slate-800">Aval IA</span>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
