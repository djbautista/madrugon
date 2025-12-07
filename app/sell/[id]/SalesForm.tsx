"use client";

import { useState, useMemo } from "react";
import { useActionState } from "react";
import { registerSale } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/pricing";
import { Minus, Plus } from "lucide-react";

interface PricingConfig {
  pMax: number;
  pMin: number;
  qFloor: number;
  qRoof: number;
  n: number;
}

interface SalesFormProps {
  watchId: number;
  maxQuantity: number;
  pricingConfig: PricingConfig;
}

/**
 * Calculate the suggested unit price based on quantity being purchased.
 * The more you buy, the cheaper per unit (wholesale volume discount).
 * 
 * - Buy qFloor (12) → pay pMax per unit
 * - Buy qRoof (120) → pay pMin per unit
 */
function calculateUnitPrice(quantity: number, config: PricingConfig): number {
  const { pMax, pMin, qFloor, qRoof, n } = config;

  // Clamp quantity between floor and roof for price calculation
  const q = Math.max(qFloor, Math.min(quantity, qRoof));

  // Calculate ratio (0 when at floor, 1 when at roof)
  const ratio = (q - qFloor) / (qRoof - qFloor);

  // Calculate price: high price at low quantity, low price at high quantity
  const unitPrice = pMax - (pMax - pMin) * Math.pow(ratio, n);

  return Math.round(unitPrice);
}

export function SalesForm({ watchId, maxQuantity, pricingConfig }: SalesFormProps) {
  const [quantity, setQuantity] = useState(pricingConfig.qFloor);
  
  const [error, formAction, isPending] = useActionState(
    async (_prevState: string | null, formData: FormData) => {
      try {
        await registerSale(formData);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Error al registrar la venta";
      }
    },
    null
  );

  // Calculate unit price based on quantity being purchased
  const unitPrice = useMemo(
    () => calculateUnitPrice(quantity, pricingConfig),
    [quantity, pricingConfig]
  );

  const totalPrice = unitPrice * quantity;

  const incrementQuantity = () => {
    setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  const exceedsStock = quantity > maxQuantity;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="watchId" value={watchId} />
      <input type="hidden" name="quantity" value={quantity} />

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label>Cantidad a Vender</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            className="h-12 text-center text-2xl font-bold"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={incrementQuantity}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        {maxQuantity <= 0 ? (
          <p className="text-sm text-amber-600 text-center font-medium">
            ⚠️ Sin stock en inventario (pendiente reposición)
          </p>
        ) : exceedsStock ? (
          <p className="text-sm text-amber-600 text-center font-medium">
            ⚠️ Excede el inventario actual ({maxQuantity} disponibles)
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            {maxQuantity} disponibles en inventario
          </p>
        )}
      </div>

      {/* Dynamic Pricing Display */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Precio Unitario:</span>
          <span className="font-semibold">{formatCurrency(unitPrice)}</span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium">Total Sugerido:</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
        </div>
        {quantity < pricingConfig.qFloor && (
          <p className="text-xs text-amber-600">
            Mínimo {pricingConfig.qFloor} unidades para precio mayorista
          </p>
        )}
        {quantity >= pricingConfig.qFloor && quantity < pricingConfig.qRoof && (
          <p className="text-xs text-green-600">
            ¡Precio mayorista aplicado! Más cantidad = mejor precio
          </p>
        )}
        {quantity >= pricingConfig.qRoof && (
          <p className="text-xs text-green-600">
            ¡Precio mínimo alcanzado!
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerName">Nombre del Cliente</Label>
        <Input
          id="customerName"
          name="customerName"
          type="text"
          placeholder="Ej: Juan Pérez"
          required
          className="h-12"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">Teléfono</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          placeholder="Ej: 3001234567"
          required
          className="h-12"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="finalPrice">
          Precio Final{" "}
          <span className="text-muted-foreground font-normal">
            (editable)
          </span>
        </Label>
        <Input
          id="finalPrice"
          name="finalPrice"
          type="number"
          key={quantity}
          defaultValue={totalPrice}
          min={0}
          step="any"
          required
          className="h-12 text-lg font-medium"
        />
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
        {isPending ? "Registrando..." : `Registrar Venta (${quantity} ${quantity === 1 ? 'unidad' : 'unidades'})`}
      </Button>
    </form>
  );
}
