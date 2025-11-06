import { getEntities, getSummaryMetrics, getAllUseCases } from "@/lib/data.server";
import HomePageClientWrapper from "./home-page-client-wrapper";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [entities, summaryMetrics, allUseCases] = await Promise.all([
    getEntities(),
    getSummaryMetrics(),
    getAllUseCases()
  ]);

  return (
    <HomePageClientWrapper 
      entities={entities} 
      summaryMetrics={summaryMetrics}
      allUseCases={allUseCases}
    />
  );
}
