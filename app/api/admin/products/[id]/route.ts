import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { productPayloadSchema } from "@/app/features/products/forms/product";
import { serializeProduct } from "../../../products/serialize";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin");
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Produk tidak ditemukan");

    const body = await request.json();
    const data = productPayloadSchema.parse(body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        stock: data.stock,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
      },
      include: { category: true },
    });

    return apiSuccess(serializeProduct(product), "Produk diupdate");
  } catch (error) {
    return apiErrorFromException(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin");
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Produk tidak ditemukan");

    await prisma.product.delete({ where: { id } });
    return apiSuccess(null, "Produk dihapus");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
