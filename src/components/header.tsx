'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Entity } from '@/lib/types';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    entity?: Entity;
    title?: string;
    rightContent?: ReactNode;
}

export function Header({ entity, title, rightContent }: HeaderProps) {
    const isHomePage = !entity && !title;
    const pageTitle = title || entity?.name || 'Seguimiento Casos de Uso';

    return (
        <header className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 shadow-lg relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between h-12 lg:h-14 px-4">
                    {/* Left: Back Button */}
                    <div className="flex-shrink-0 w-10">
                        {!isHomePage && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                asChild
                                className="text-white/90 hover:bg-white/10 hover:text-white"
                            >
                                <Link href={entity && !title ? "/" : `/${entity?.id}`}>
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="sr-only">Volver</span>
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Center: Title */}
                    <div className="flex-1 flex justify-center px-4">
                        <h1 className={cn(
                            "text-white font-semibold text-center truncate max-w-full",
                            title ? "text-sm lg:text-base" : "text-base lg:text-lg"
                        )}>
                            {pageTitle}
                        </h1>
                    </div>

                    {/* Right: Logo or Custom Content */}
                    <div className="flex-shrink-0 w-10 flex justify-end">
                        {rightContent ? (
                            <div className="text-white">
                                {rightContent}
                            </div>
                        ) : isHomePage && (
                            <Image
                                src="/logo-aa-02.png"
                                alt="Logo"
                                width={60}
                                height={16}
                                className="h-4 w-auto"
                                unoptimized
                            />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
