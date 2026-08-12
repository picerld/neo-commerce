import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { serializeProduct, getSoldCountMap } from "../serialize";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findFirst({ where: { slug, isActive: true }, include: { category: true } });
    if (!product) throw new NotFoundError("Produk tidak ditemukan");

    const soldCounts = await getSoldCountMap([product.id]);

    return apiSuccess(serializeProduct(product, soldCounts.get(product.id) ?? 0));
  } catch (error) {
    return apiErrorFromException(error);
  }
}
