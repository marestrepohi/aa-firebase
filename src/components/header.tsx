import Link from 'next/link';
import Image from "next/image";
import { ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Entity } from '@/lib/types';

interface HeaderProps {
    entity?: Entity;
}

export function Header({ entity }: HeaderProps) {
    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 justify-center">
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
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {entity ? (
                                <div className="flex items-center gap-4">
                                     <div className="bg-white border rounded-lg p-1 flex items-center justify-center h-10 w-10">
                                        <Image src={entity.logo} alt={`${entity.name} logo`} width={32} height={32} className="object-contain" />
                                    </div>
                                    <span className="text-primary font-bold text-lg">{entity.name}</span>
                                </div>
                            ) : (
                                <span className="text-primary font-semibold">Aval Digital Labs</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
