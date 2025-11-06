import { getEntities, getSummaryMetrics, getAllUseCases } from "@/lib/data.server";
import { Header } from "@/components/header";
import HomePageClient from "./home-page-client";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [entities, summaryMetrics, allUseCases] = await Promise.all([
    getEntities(),
    getSummaryMetrics(),
    getAllUseCases()
  ]);

  return (
    <>
      <Header />
      <HomePageClient 
        entities={entities} 
        summaryMetrics={summaryMetrics}
        allUseCases={allUseCases}
      />
    </>
  );
}
