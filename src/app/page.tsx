import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

export default function Home() {
  return (
    <div>
      <PageHeader
        title="Welcome to ADL Analytics Hub"
        description="Your central dashboard for managing entities and use cases."
      />
      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-lg">
                <List className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">Getting Started</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Select an entity from the sidebar to view its use cases, or create a new one to begin.</p>
            <p className="mt-4">This dashboard allows you to monitor and manage all analytics projects within ADL.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
