"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function registerSale(formData: FormData) {
  const watchId = parseInt(formData.get("watchId") as string);
  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const finalPrice = parseFloat(formData.get("finalPrice") as string);
  const quantity = parseInt(formData.get("quantity") as string) || 1;

  if (!watchId || !customerName || !customerPhone || isNaN(finalPrice) || quantity < 1) {
    throw new Error("Datos incompletos");
  }

  // Create sale and decrement stock in a transaction
  await prisma.$transaction(async (tx) => {
    // Verify watch exists
    const watch = await tx.watch.findUnique({
      where: { id: watchId },
    });

    if (!watch) {
      throw new Error("Reloj no encontrado");
    }

    // Create the sale
    await tx.sale.create({
      data: {
        watchId,
        customerName,
        customerPhone,
        quantity,
        finalPrice,
      },
    });

    // Decrement stock by quantity sold (can go negative)
    await tx.watch.update({
      where: { id: watchId },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });
  });

  revalidatePath("/");
  revalidatePath(`/sell/${watchId}`);
  redirect("/?success=true");
}

export async function updatePricingConfig(formData: FormData) {
  const pMax = parseFloat(formData.get("pMax") as string);
  const pMin = parseFloat(formData.get("pMin") as string);
  const qFloor = parseInt(formData.get("qFloor") as string);
  const qRoof = parseInt(formData.get("qRoof") as string);
  const n = parseFloat(formData.get("n") as string);

  if (isNaN(pMax) || isNaN(pMin) || isNaN(qFloor) || isNaN(qRoof) || isNaN(n)) {
    throw new Error("Datos inválidos");
  }

  await prisma.pricingConfig.upsert({
    where: { id: 1 },
    update: { pMax, pMin, qFloor, qRoof, n },
    create: { id: 1, pMax, pMin, qFloor, qRoof, n },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  redirect("/settings?success=true");
}

