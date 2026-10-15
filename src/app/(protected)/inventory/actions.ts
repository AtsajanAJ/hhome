"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { inventoryInputSchema } from "@/lib/validations/inventory";

type InventoryActionResult = { ok: true } | { ok: false; error: string };

function actionError(error: unknown): InventoryActionResult {
  if (error instanceof Error && error.message === "Unauthorized") return { ok: false, error: "Your session has expired. Please sign in again." };
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function createInventoryItem(input: unknown): Promise<InventoryActionResult> {
  try {
    const user = await requireUser();
    const item = inventoryInputSchema.parse(input);
    await prisma.inventoryItem.create({ data: { ...item, category: item.category || null, location: item.location || null, notes: item.notes || null, userId: user.id } });
    revalidatePath("/inventory");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateInventoryItem(id: string, input: unknown): Promise<InventoryActionResult> {
  try {
    const user = await requireUser();
    const item = inventoryInputSchema.parse(input);
    const result = await prisma.inventoryItem.updateMany({ where: { id, userId: user.id }, data: { ...item, category: item.category || null, location: item.location || null, notes: item.notes || null } });
    if (result.count === 0) return { ok: false, error: "Item not found." };
    revalidatePath("/inventory");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function adjustInventoryQuantity(id: string, amount: number): Promise<InventoryActionResult> {
  try {
    const user = await requireUser();
    const item = await prisma.inventoryItem.findFirst({ where: { id, userId: user.id }, select: { quantity: true } });
    if (!item) return { ok: false, error: "Item not found." };
    await prisma.inventoryItem.updateMany({ where: { id, userId: user.id }, data: { quantity: Math.max(0, item.quantity + Math.trunc(amount)) } });
    revalidatePath("/inventory");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteInventoryItem(id: string): Promise<InventoryActionResult> {
  try {
    const user = await requireUser();
    const result = await prisma.inventoryItem.deleteMany({ where: { id, userId: user.id } });
    if (result.count === 0) return { ok: false, error: "Item not found." };
    revalidatePath("/inventory");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
