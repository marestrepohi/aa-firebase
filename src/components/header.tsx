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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Left: Back Button */}
                    <div className="flex-shrink-0 w-10">
                        {!isHomePage && (
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-white hover:bg-white/20 hover:text-white btn-icon-md"
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
                        <h1 className="text-white font-bold text-base md:text-lg text-center truncate max-w-full">
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
                                className="h-4 w-auto md:h-5"
                                unoptimized
                            />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
