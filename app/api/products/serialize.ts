import type { Product, Category } from "@/generated/prisma/client";
import type { ProductSummary } from "@/app/features/products/types/product.type";
import { prisma } from "@/lib/prisma";

export function serializeProduct(
  product: Product & { category: Category | null },
  soldCount = 0,
  rating: { avgRating: number; reviewCount: number } = { avgRating: 0, reviewCount: 0 },
): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    category: product.category ? { id: product.category.id, name: product.category.name, slug: product.category.slug } : null,
    soldCount,
    avgRating: rating.avgRating,
    reviewCount: rating.reviewCount,
    createdAt: product.createdAt.toISOString(),
  };
}

const SOLD_STATUSES = ["paid", "processing", "shipped", "completed"] as const;

/** Sum of ordered quantity per product across paid+ orders — used for the
 * marketplace-style "X terjual" badge on public product cards. */
export async function getSoldCountMap(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, number>();
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, order: { status: { in: [...SOLD_STATUSES] } } },
    _sum: { quantity: true },
  });
  return new Map(rows.map((row) => [row.productId, row._sum.quantity ?? 0]));
}

/** Average rating + review count per product — used for the star-rating
 * badge on product cards and the PDP rating summary. */
export async function getRatingMap(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, { avgRating: number; reviewCount: number }>();
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return new Map(rows.map((row) => [row.productId, { avgRating: row._avg.rating ?? 0, reviewCount: row._count.rating }]));
}
