import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { getSession, requireSession } from "@/lib/auth/session";
import { createReviewFormSchema } from "@/app/features/reviews/forms/review";
import type { ReviewListResponse } from "@/app/features/reviews/types/review.type";

async function getProductIdOrThrow(slug: string) {
  const product = await prisma.product.findFirst({ where: { slug, isActive: true }, select: { id: true } });
  if (!product) throw new NotFoundError("Produk tidak ditemukan");
  return product.id;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const productId = await getProductIdOrThrow(slug);
    const session = await getSession();

    const [reviews, viewerReview] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      session ? prisma.review.findUnique({ where: { productId_userId: { productId, userId: session.userId } } }) : null,
    ]);

    const histogram: ReviewListResponse["histogram"] = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const review of reviews) {
      const key = String(review.rating) as keyof typeof histogram;
      if (key in histogram) histogram[key]++;
    }
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

    const response: ReviewListResponse = {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.user.name,
        createdAt: r.createdAt.toISOString(),
      })),
      avgRating,
      reviewCount,
      histogram,
      viewerHasReviewed: !!viewerReview,
    };

    return apiSuccess(response);
  } catch (error) {
    return apiErrorFromException(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    const productId = await getProductIdOrThrow(slug);

    const body = await request.json();
    const data = createReviewFormSchema.parse(body);

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId, userId: session.userId } },
    });
    if (existing) throw new ConflictError("Kamu sudah memberikan ulasan untuk produk ini");

    await prisma.review.create({
      data: { productId, userId: session.userId, rating: data.rating, comment: data.comment || null },
    });

    return apiSuccess(null, "Ulasan berhasil dikirim", 201);
  } catch (error) {
    return apiErrorFromException(error);
  }
}
