import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { updateCartItemFormSchema } from "@/app/features/cart/forms/cart";
import { serializeCart } from "../serialize";

export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const session = await requireSession();
    const { itemId } = await params;

    const existing = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: session.userId },
      include: { product: true },
    });
    if (!existing) throw new NotFoundError("Item keranjang tidak ditemukan");

    const body = await request.json();
    const data = updateCartItemFormSchema.parse(body);

    if (data.quantity > existing.product.stock) {
      return apiError(`Stok "${existing.product.name}" hanya tersisa ${existing.product.stock}`, 409);
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: data.quantity } });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(serializeCart(cartItems), "Keranjang diupdate");
  } catch (error) {
    return apiErrorFromException(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const session = await requireSession();
    const { itemId } = await params;

    const existing = await prisma.cartItem.findFirst({ where: { id: itemId, userId: session.userId } });
    if (!existing) throw new NotFoundError("Item keranjang tidak ditemukan");

    await prisma.cartItem.delete({ where: { id: itemId } });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(serializeCart(cartItems), "Item dihapus dari keranjang");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
