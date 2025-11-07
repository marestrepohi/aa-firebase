import { getEntities, getAllUseCases } from "@/lib/data.server";
import HomePageClientWrapper from "./home-page-client-wrapper";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [entities, allUseCases] = await Promise.all([
    getEntities(),
    getAllUseCases()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomePageClientWrapper 
          entities={entities} 
          allUseCases={allUseCases}
        />
    </div>
  );
}
