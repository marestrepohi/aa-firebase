import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/toaster"
import { MainSidebar } from '@/components/main-sidebar';
import { getEntities } from '@/lib/data';

export const metadata: Metadata = {
  title: 'ADL Analytics Hub',
  description: 'Management dashboard for the advanced analytics area of ADL',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const entities = await getEntities();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <MainSidebar entities={entities} />
          <SidebarInset>
            <main className="min-h-screen p-4 md:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
