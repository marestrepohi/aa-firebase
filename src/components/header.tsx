'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Entity } from '@/lib/types';
import { ReactNode } from 'react';

interface HeaderProps {
    entity?: Entity;
    title?: string;
    rightContent?: ReactNode;
}

export function Header({ entity, title, rightContent }: HeaderProps) {
    const isHomePage = !entity && !title;
    const pageTitle = title || entity?.name || 'Seguimiento Casos de Uso';
    
    return (
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-md">
            <div className="relative h-16 flex items-center justify-center">
                {/* Centered Title */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg text-center px-16 truncate">
                        {pageTitle}
                    </span>
                </div>

                {/* Container for side buttons, aligned with content */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-between h-full">
                        {/* Left Button */}
                        <div className="flex-shrink-0">
                            {!isHomePage && (
                                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white">
                                    <Link href={entity && !title ? "/" : `/${entity?.id}`}>
                                        <ChevronLeft className="h-5 w-5" />
                                        <span className="sr-only">Volver</span>
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Right Content */}
                        <div className="flex-shrink-0">
                             {rightContent ? (
                                 <div className="text-white">
                                    {rightContent}
                                 </div>
                             ) : isHomePage && (
                                <div className="flex-shrink-0">
                                    <Image src="/logo-aa-02.png" alt="Logo" width={80} height={22} unoptimized />
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
