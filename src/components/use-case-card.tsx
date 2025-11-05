import Link from "next/link";
import type { UseCase } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { formatDistanceToNow } from "date-fns";

export function UseCaseCard({ useCase }: { useCase: UseCase }) {
  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary">
      <CardHeader>
        <CardTitle className="text-lg font-bold line-clamp-2">{useCase.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{useCase.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
         <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
            <StatusPill status={useCase.status} />
            <time dateTime={useCase.lastUpdated}>
                {formatDistanceToNow(new Date(useCase.lastUpdated), { addSuffix: true })}
            </time>
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/entities/${useCase.entityId}/use-cases/${useCase.id}`}>
            Ver Métricas
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
