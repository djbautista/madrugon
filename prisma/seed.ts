import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const watches = [
  { id: 1, name: "Reloj hip hop plateado, fondo verde", stockQuantity: 30 },
  { id: 2, name: "Reloj hip hop plateado, fondo azul", stockQuantity: 30 },
  { id: 3, name: "Reloj hip hop plateado, fondo rojo", stockQuantity: 30 },
  { id: 4, name: "Reloj hip hop plateado, fondo plateado", stockQuantity: 30 },
  { id: 5, name: "Reloj hip hop imperial, fondo verde", stockQuantity: 30 },
  { id: 6, name: "Reloj hip hop imperial, fondo azul", stockQuantity: 30 },
  { id: 7, name: "Reloj hip hop imperial, fondo rojo", stockQuantity: 30 },
  { id: 8, name: "Reloj hip hop imperial, fondo blanco", stockQuantity: 30 },
  { id: 9, name: "Reloj hip hop imperial, fondo dorado", stockQuantity: 30 },
  { id: 10, name: "Reloj hip hop dorado, fondo verde", stockQuantity: 30 },
  { id: 11, name: "Reloj hip hop dorado, fondo azul", stockQuantity: 30 },
  { id: 12, name: "Reloj hip hop dorado, fondo rojo", stockQuantity: 30 },
  { id: 13, name: "Reloj hip hop plateado, fondo blanco", stockQuantity: 30 },
  { id: 14, name: "Reloj octagonal plateado", stockQuantity: 30 },
  { id: 15, name: "Reloj octagonal dorado", stockQuantity: 30 },
  { id: 16, name: "Reloj multicolor dorado", stockQuantity: 30 },
  { id: 17, name: "Reloj multicolor plateado", stockQuantity: 30 },
  { id: 18, name: "Reloj cuadrado plateado", stockQuantity: 30 },
  { id: 19, name: "Reloj cuadrado dorado", stockQuantity: 30 },
  { id: 20, name: "Reloj ovalado plateado", stockQuantity: 30 },
  { id: 21, name: "Reloj ovalado dorado", stockQuantity: 30 },
  { id: 22, name: "Reloj plateado rosado", stockQuantity: 30 },
];

async function main() {
  console.log("Seeding database...");

  // Seed PricingConfig (upsert to ensure only one record)
  await prisma.pricingConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      pMax: 29900,
      pMin: 19900,
      qFloor: 12,
      qRoof: 120,
      n: 1.0,
    },
  });
  console.log("✓ PricingConfig created");

  // Seed Watches
  for (const watch of watches) {
    await prisma.watch.upsert({
      where: { id: watch.id },
      update: { name: watch.name, stockQuantity: watch.stockQuantity },
      create: watch,
    });
  }
  console.log("✓ 22 Watches created");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

