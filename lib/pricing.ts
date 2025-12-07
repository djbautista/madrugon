import { PricingConfig } from "@prisma/client";

/**
 * Calculate the suggested price based on stock quantity and pricing configuration.
 * 
 * Formula:
 * 1. q = Clamp stockQuantity between qFloor and qRoof
 * 2. ratio = (q - qFloor) / (qRoof - qFloor)
 * 3. suggestedPrice = pMax - (pMax - pMin) * (ratio ^ n)
 * 
 * When stock is low (at qFloor), price is at pMax.
 * When stock is high (at qRoof), price approaches pMin.
 */
export function calculateSuggestedPrice(
  stockQuantity: number,
  config: PricingConfig
): number {
  const { pMax, pMin, qFloor, qRoof, n } = config;

  // Clamp stock between floor and roof
  const q = Math.max(qFloor, Math.min(stockQuantity, qRoof));

  // Calculate ratio (0 when at floor, 1 when at roof)
  const ratio = (q - qFloor) / (qRoof - qFloor);

  // Calculate price: high price at low stock, low price at high stock
  const suggestedPrice = pMax - (pMax - pMin) * Math.pow(ratio, n);

  return Math.round(suggestedPrice);
}

/**
 * Format a number as Colombian Peso currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

