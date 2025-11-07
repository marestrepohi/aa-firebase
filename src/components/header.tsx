'use client';

import Link from 'next/link';
import Image from "next/image";
import { ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Entity } from '@/lib/types';
import { ReactNode } from 'react';

interface HeaderProps {
    entity?: Entity;
    editButton?: {
        label: string;
        onClick: () => void;
    };
    rightContent?: ReactNode;
}

export function Header({ entity, editButton, rightContent }: HeaderProps) {
    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center">
                    {/* Left Section (Back Button) */}
                    <div className="flex-none flex items-center">
                        {entity ? (
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/">
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="sr-only">Volver</span>
                                </Link>
                            </Button>
                        ) : (
                            // Placeholder to keep title centered if no back button
                            <div className="w-10"></div>
                        )}
                    </div>
                    
                    {/* Center Section (Title) */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex flex-shrink-0 items-center">
                            {entity ? (
                                <span className="text-primary font-bold text-lg">{entity.name}</span>
                            ) : (
                                <span className="text-primary font-semibold text-lg">Aval Digital Labs</span>
                            )}
                        </div>
                    </div>

                    {/* Right Section (Actions) */}
                    <div className="flex-none flex items-center justify-end gap-2">
                         {rightContent}
                         {/* Placeholder to keep title centered if no actions */}
                         {!rightContent && <div className="w-10"></div>}
                    </div>
                </div>
            </div>
        </header>
    );
}
