import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { productPayloadSchema } from "@/app/features/products/forms/product";
import { slugify } from "@/lib/slugify";
import { serializeProduct } from "../../products/serialize";

export async function GET() {
  try {
    await requireRole("admin");

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(products.map((product) => serializeProduct(product)));
  } catch (error) {
    return apiErrorFromException(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("admin");

    const body = await request.json();
    const data = productPayloadSchema.parse(body);

    const baseSlug = slugify(data.name) || "produk";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        description: data.description || null,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
      },
      include: { category: true },
    });

    return apiSuccess(serializeProduct(product), "Produk dibuat", 201);
  } catch (error) {
    return apiErrorFromException(error);
  }
}
