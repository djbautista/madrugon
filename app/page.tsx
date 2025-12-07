import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { WatchGrid } from "@/components/WatchGrid";

async function getWatches() {
  return prisma.watch.findMany({
    orderBy: { id: "asc" },
  });
}

export default async function DashboardPage() {
  const watches = await getWatches();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <WatchGrid watches={watches} />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
