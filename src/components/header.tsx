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
    
    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center">
                    {/* Left Section (Back Button) */}
                    <div className="flex-none flex items-center" style={{ minWidth: '40px' }}>
                        {!isHomePage ? (
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/">
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="sr-only">Volver</span>
                                </Link>
                            </Button>
                        ) : (
                            <div className="w-10"></div>
                        )}
                    </div>
                    
                    {/* Center Section (Title) */}
                    <div className="flex-1 flex justify-center items-center gap-4">
                        <div className="flex flex-shrink-0 items-center">
                            <span className="text-primary font-bold text-lg">
                                {title ? title : (entity ? entity.name : 'Seguimiento Casos de Uso')}
                            </span>
                        </div>
                         {/* If there's a button, show logo next to title */}
                        {rightContent && (
                            <div className="flex-shrink-0">
                                <Image src="/logo-aa-01.png" alt="Logo" width={90} height={25} unoptimized />
                            </div>
                        )}
                    </div>

                    {/* Right Section (Actions or Logo) */}
                    <div className="flex-none flex items-center justify-end" style={{ minWidth: '40px' }}>
                         {rightContent ? (
                             rightContent
                         ) : (
                            <div className="flex-shrink-0">
                                <Image src="/logo-aa-01.png" alt="Logo" width={90} height={25} unoptimized />
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </header>
    );
}
