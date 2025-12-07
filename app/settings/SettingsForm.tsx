"use client";

import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { updatePricingConfig } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SettingsFormProps {
  config: {
    pMax: number;
    pMin: number;
    qFloor: number;
    qRoof: number;
    n: number;
  };
}

export function SettingsForm({ config }: SettingsFormProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("¡Configuración guardada exitosamente!");
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  const [error, formAction, isPending] = useActionState(
    async (_prevState: string | null, formData: FormData) => {
      try {
        await updatePricingConfig(formData);
        return null;
      } catch (e) {
        return e instanceof Error
          ? e.message
          : "Error al guardar la configuración";
      }
    },
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="pMax">Precio Máximo (pMax)</Label>
        <Input
          id="pMax"
          name="pMax"
          type="number"
          defaultValue={config.pMax}
          min={0}
          step={100}
          required
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Precio cuando el stock está en el piso
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pMin">Precio Mínimo (pMin)</Label>
        <Input
          id="pMin"
          name="pMin"
          type="number"
          defaultValue={config.pMin}
          min={0}
          step={100}
          required
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Precio cuando el stock está en el techo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qFloor">Stock Piso (qFloor)</Label>
          <Input
            id="qFloor"
            name="qFloor"
            type="number"
            defaultValue={config.qFloor}
            min={0}
            step={1}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qRoof">Stock Techo (qRoof)</Label>
          <Input
            id="qRoof"
            name="qRoof"
            type="number"
            defaultValue={config.qRoof}
            min={1}
            step={1}
            required
            className="h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="n">Factor de Curva (n)</Label>
        <Input
          id="n"
          name="n"
          type="number"
          defaultValue={config.n}
          min={0.1}
          max={10}
          step={0.1}
          required
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          1 = lineal, {"<"}1 = descuento rápido al inicio, {">"}1 = descuento
          lento al inicio
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-14 text-lg font-semibold"
        disabled={isPending}
      >
        {isPending ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </form>
  );
}

