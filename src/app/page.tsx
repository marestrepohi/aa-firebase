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
    <HomePageClientWrapper 
      entities={entities} 
      allUseCases={allUseCases}
    />
  );
}
