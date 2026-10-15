import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { InventoryPage } from "@/components/inventory/inventory-page";

export const instant = false;

export default async function InventoryRoute() {
  const user = await requireUser();
  const items = await prisma.inventoryItem.findMany({ where: { userId: user.id }, orderBy: [{ category: "asc" }, { name: "asc" }], select: { id: true, name: true, category: true, quantity: true, location: true, notes: true } });
  return <InventoryPage initialItems={items} />;
}
