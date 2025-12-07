"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Search } from "lucide-react";

interface Watch {
  id: number;
  name: string;
  stockQuantity: number;
}

interface WatchGridProps {
  watches: Watch[];
}

function getStockBadgeVariant(quantity: number): "default" | "secondary" | "destructive" {
  if (quantity < 3) return "destructive";
  if (quantity < 10) return "secondary";
  return "default";
}

function getStockBadgeClass(quantity: number): string {
  if (quantity < 3) return "bg-red-500 hover:bg-red-600";
  if (quantity < 10) return "bg-yellow-500 hover:bg-yellow-600 text-black";
  return "bg-green-500 hover:bg-green-600";
}

export function WatchGrid({ watches }: WatchGridProps) {
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("¡Venta registrada exitosamente!");
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const filteredWatches = watches.filter((watch) =>
    watch.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar relojes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Link
              href="/settings"
              className="flex items-center justify-center h-11 w-11 rounded-md border bg-background hover:bg-accent transition-colors"
              aria-label="Configuración"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Watch Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWatches.map((watch) => (
            <Link key={watch.id} href={`/sell/${watch.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="aspect-square relative bg-muted">
                  <Image
                    src={`/watches/${watch.id}.png`}
                    alt={watch.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm leading-tight mb-2 line-clamp-2">
                    {watch.name}
                  </h3>
                  <Badge className={getStockBadgeClass(watch.stockQuantity)}>
                    Stock: {watch.stockQuantity}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredWatches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No se encontraron relojes</p>
          </div>
        )}
      </main>
    </div>
  );
}

