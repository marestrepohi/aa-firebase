import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h2 className="text-4xl font-bold mb-4">404 - Página No Encontrada</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                Lo sentimos, no pudimos encontrar el recurso que estás buscando. Es posible que haya sido movido o eliminado.
            </p>
            <Button asChild>
                <Link href="/">
                    Volver al Inicio
                </Link>
            </Button>
        </div>
    );
}
