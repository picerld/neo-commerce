import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { serializeProduct, getSoldCountMap } from "./serialize";
import type { Prisma } from "@/generated/prisma/client";

// Public catalog listing — only active products, optionally filtered by
// search term and/or category slug.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const categorySlug = searchParams.get("category")?.trim();

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (categorySlug) where.category = { slug: categorySlug };

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const soldCounts = await getSoldCountMap(products.map((p) => p.id));

    return apiSuccess(products.map((product) => serializeProduct(product, soldCounts.get(product.id) ?? 0)));
  } catch (error) {
    return apiErrorFromException(error);
  }
}
