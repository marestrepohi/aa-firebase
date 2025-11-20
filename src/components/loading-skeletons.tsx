import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EntityCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                    <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full flex-shrink-0" />
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex justify-around items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-6 w-8" />
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-6 w-8" />
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-6 w-8" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function UseCaseCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-6 pt-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                    </div>
                    <div className="rounded-md p-3 bg-muted">
                        <Skeleton className="h-3 w-40 mb-1" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                </div>
                <div className="flex-grow" />
                <div className="pt-4 border-t flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}
