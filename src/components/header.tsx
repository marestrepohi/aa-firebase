import Link from 'next/link';
import { AvalIALogo } from '@/components/icons';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <AvalIALogo className="h-8 w-auto" />
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-primary font-semibold">Aval Digital Labs</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
