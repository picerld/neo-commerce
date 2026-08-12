import type { CartItem, Product } from "@/generated/prisma/client";
import type { CartResponse } from "@/app/features/cart/types/cart.type";

export function serializeCart(cartItems: (CartItem & { product: Product })[]): CartResponse {
  const items = cartItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    productImageUrl: item.product.imageUrl,
    price: item.product.price,
    stock: item.product.stock,
    isActive: item.product.isActive,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.filter((item) => item.isActive).reduce((sum, item) => sum + item.subtotal, 0),
  };
}
