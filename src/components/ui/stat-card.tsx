import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: {
        value: number;
        direction: 'up' | 'down' | 'neutral';
    };
    icon?: React.ReactNode;
    iconBgColor?: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    description,
    trend,
    icon,
    iconBgColor = "bg-primary/10 text-primary",
    className,
}: StatCardProps) {
    const TrendIcon = trend?.direction === 'up'
        ? TrendingUp
        : trend?.direction === 'down'
            ? TrendingDown
            : Minus;

    const trendColor = trend?.direction === 'up'
        ? 'text-state-success bg-state-success/10'
        : trend?.direction === 'down'
            ? 'text-state-error bg-state-error/10'
            : 'text-muted-foreground bg-muted';

    return (
        <div
            className={cn(
                "bg-card p-5 rounded-2xl border border-border shadow-soft hover:shadow-lg transition-all duration-200 group",
                className
            )}
        >
            <div className="flex justify-between items-start mb-4">
                {icon && (
                    <div className={cn(
                        "p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-110",
                        iconBgColor
                    )}>
                        {icon}
                    </div>
                )}

                {trend && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                        trendColor
                    )}>
                        <TrendIcon className="h-3 w-3" />
                        {Math.abs(trend.value)}%
                    </span>
                )}
            </div>

            <h4 className="text-2xl font-bold text-foreground tracking-tight">
                {value}
            </h4>

            <p className="text-xs text-muted-foreground mt-1">
                {title}
            </p>

            {description && (
                <p className="text-xs text-muted-foreground/70 mt-2 truncate-2">
                    {description}
                </p>
            )}
        </div>
    );
}

export interface StatCardGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}

export function StatCardGrid({
    children,
    columns = 3,
    className
}: StatCardGridProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn(
            "grid gap-4",
            gridCols[columns],
            className
        )}>
            {React.Children.map(children, (child, index) => (
                <div
                    className="animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}
