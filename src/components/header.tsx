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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute left-0 flex items-center">
                        {!isHomePage && (
                            <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white">
                                <Link href={entity ? "/" : `/${entity?.id}`}>
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="sr-only">Volver</span>
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-white font-bold text-lg text-center">
                            {pageTitle}
                        </span>
                    </div>

                    <div className="absolute right-0 flex items-center">
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
        </header>
    );
}
