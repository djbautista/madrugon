import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SalesForm } from "./SalesForm";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getWatchWithPricing(id: number) {
  const [watch, pricingConfig] = await Promise.all([
    prisma.watch.findUnique({ where: { id } }),
    prisma.pricingConfig.findFirst({ where: { id: 1 } }),
  ]);

  return { watch, pricingConfig };
}

export default async function SellPage({ params }: PageProps) {
  const { id } = await params;
  const watchId = parseInt(id);

  if (isNaN(watchId)) {
    notFound();
  }

  const { watch, pricingConfig } = await getWatchWithPricing(watchId);

  if (!watch || !pricingConfig) {
    notFound();
  }

  const stockLevel = watch.stockQuantity;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inventario
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Watch Image */}
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-6">
          <Image
            src={`/watches/${watch.id}.png`}
            alt={watch.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, 512px"
          />
        </div>

        {/* Watch Info */}
        <div className="space-y-4 mb-6">
          <h1 className="text-xl font-bold leading-tight">{watch.name}</h1>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant={stockLevel <= 0 ? "destructive" : "secondary"}
              className={
                stockLevel <= 0
                  ? ""
                  : stockLevel < 3
                  ? "bg-red-500"
                  : stockLevel < 10
                  ? "bg-yellow-500 text-black"
                  : "bg-green-500"
              }
            >
              Stock: {stockLevel}
            </Badge>
          </div>
        </div>

        {/* Sales Form - Always shown, stock is informational only */}
        <SalesForm
          watchId={watch.id}
          maxQuantity={Math.max(0, stockLevel)}
          pricingConfig={{
            pMax: pricingConfig.pMax,
            pMin: pricingConfig.pMin,
            qFloor: pricingConfig.qFloor,
            qRoof: pricingConfig.qRoof,
            n: pricingConfig.n,
          }}
        />
      </main>
    </div>
  );
}

