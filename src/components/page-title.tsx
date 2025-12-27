'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageTitleProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: BreadcrumbItem[];
    rightContent?: ReactNode;
    className?: string;
}

export function PageTitle({
    title,
    subtitle,
    breadcrumbs = [],
    rightContent,
    className
}: PageTitleProps) {
    return (
        <div className={cn("mb-6", className)}>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    {breadcrumbs.map((item, index) => (
                        <span key={index} className="flex items-center gap-1">
                            {index > 0 && <ChevronRight className="h-3 w-3" />}
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-foreground">{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}

            {/* Title Row */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
                {rightContent && (
                    <div className="flex items-center gap-2">
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
}
