'use client';

import Link from 'next/link';
import Image from "next/image";
import { ChevronLeft, Pencil } from 'lucide-react';
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
                <div className="relative flex h-16 items-center justify-between">
                    {entity && (
                        <div className="absolute inset-y-0 left-0 flex items-center">
                             <Button variant="outline" asChild>
                                <Link href="/">
                                    <ChevronLeft className="-ml-1 mr-2 h-4 w-4" />
                                    Volver
                                </Link>
                            </Button>
                        </div>
                    )}
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex flex-shrink-0 items-center">
                            {entity ? (
                                <div className="flex items-center gap-4">
                                     <div className="bg-white border rounded-lg p-1 flex items-center justify-center h-10 w-10">
                                        {entity.logo ? (
                                            <Image src={entity.logo} alt={`${entity.name} logo`} width={32} height={32} className="object-contain" />
                                        ) : (
                                            <div className="text-xs text-muted-foreground"></div>
                                        )}
                                    </div>
                                    <span className="text-primary font-bold text-lg">{entity.name}</span>
                                </div>
                            ) : (
                                <span className="text-primary font-semibold text-lg">Aval Digital Labs</span>
                            )}
                        </div>
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center gap-2">
                        {rightContent}
                        {editButton && (
                            <Button 
                                variant="outline" 
                                onClick={editButton.onClick}
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                {editButton.label}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
