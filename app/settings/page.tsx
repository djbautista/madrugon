import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import { ArrowLeft } from "lucide-react";

async function getPricingConfig() {
  return prisma.pricingConfig.findFirst({ where: { id: 1 } });
}

export default async function SettingsPage() {
  const config = await getPricingConfig();

  const defaultConfig = config || {
    pMax: 29900,
    pMin: 19900,
    qFloor: 12,
    qRoof: 120,
    n: 1.0,
  };

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configuración de Precios</h1>
          <p className="text-muted-foreground mt-1">
            Ajusta los parámetros globales de precios dinámicos
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg mb-6">
          <h2 className="font-medium mb-2">Fórmula de Precio Sugerido</h2>
          <p className="text-sm text-muted-foreground">
            El precio se calcula así: cuando el stock está en el <strong>piso</strong>, 
            el precio es el <strong>máximo</strong>. Cuando el stock alcanza el <strong>techo</strong>, 
            el precio baja hacia el <strong>mínimo</strong>. El factor de curva controla 
            qué tan rápido baja el precio.
          </p>
        </div>

        <Suspense fallback={<SettingsFormSkeleton />}>
          <SettingsForm config={defaultConfig} />
        </Suspense>
      </main>
    </div>
  );
}

function SettingsFormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
        </div>
      ))}
      <div className="h-14 bg-muted rounded animate-pulse" />
    </div>
  );
}

